// AP Stats Formula Defense - Sound Engine
// Extracted from index.html. Published as window.TD_AUDIO.
(function(){
  // ── FM Synthesis polyphonic engine ──
  // 15 voices: 0-2 FM pad, 3 FM bass, 4 FM kick, 5 FM snare, 6 FM hihat, 7-13 FM SFX pool, 14 FM melody
  let ctx=null,muted=false,masterGain=null,bgmPlaying=false;
  let voices=[],noiseGate=null,noiseLP=null,noiseBP=null;
  let padBus=null,bassBus=null,sfxBus=null,drumBus=null,melodyBus=null;
  let savedMelody=null; // array of 8 entries: MIDI note number or null (rest)
  let melodyMuted=false; // true during compose mode to prevent seq() contention on voice 14
  let bgmSeqTimer=null,currentWaveIdx=0,previewTimer=null,previewConfig=null;
  let barStartTime=0,barLength=1; // track current bar timing for beat playhead
  let currentStreak=0,musicalHealth=5;
  const MUSIC_STORAGE_KEY='td-music-config-v1';

  // ── MUSIC CONFIG — edit these to customize each wave's sound ──
  const DEFAULT_MUSIC_CONFIG=[
    {name:'Dire Straits "So Far Away"',     // W1
      chords:[[220,262,330],[196,247,294],[175,220,262],[165,208,247]],
      bass:[1,0,1,.75,0,1,1.5,.75], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:90, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,0,1,0,0,0], snare:[0,0,0,0,0,0,1,0], kickVol:.30, snareVol:.25},
    {name:'A-ha "Take On Me"',              // W2
      chords:[[220,277,330],[185,220,277],[147,185,220],[165,208,247]],
      bass:[1,1,0,1.5,1,0,1.335,1], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:110, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,0,1,0,0,0], snare:[0,0,0,0,1,0,0,0], kickVol:.30, snareVol:.25},
    {name:'Grieg "Morning Mood"',           // W3
      chords:[[165,208,247],[208,247,311],[220,277,330],[247,311,370]],
      bass:[1,0,0,1.189,0,0,1.335,0], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:72, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,0,1,0,0,0], snare:[0,0,0,0,0,0,1,0], kickVol:.30, snareVol:.25},
    {name:'Pachelbel\'s Canon',             // W4
      chords:[[147,185,220],[220,277,330],[247,294,370],[185,220,277]],
      bass:[1,1.5,1.335,1,1.189,1,1.5,1], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:80, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,1,0,0,1,0], snare:[0,0,0,0,1,0,0,0], kickVol:.30, snareVol:.25},
    {name:'Beethoven "Fur Elise"',          // W5
      chords:[[220,262,330],[165,208,247],[220,262,330],[262,330,392]],
      bass:[1,0,1,0,1,0,1.189,0], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:76, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,1,0,0,1,0], snare:[0,0,0,0,1,0,0,1], kickVol:.30, snareVol:.25},
    {name:'Vivaldi "Winter"',               // W6 — peak tension
      chords:[[175,208,262],[131,156,196],[139,175,208],[156,196,233]],
      bass:[1,1,1,1.189,1,1,1.335,1.5], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:120, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,1,0,1,0,1,0], snare:[0,0,0,0,1,0,0,1], kickVol:.30, snareVol:.25},
    {name:'Bach "Air on G String"',         // W7
      chords:[[196,247,294],[165,196,247],[220,262,330],[147,185,220]],
      bass:[1,0,0,1.5,0,0,1.335,0], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:60, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,0,1,0,1,0], snare:[0,0,1,0,0,0,1,0], kickVol:.30, snareVol:.25},
    {name:'Chrono Trigger "Corridors of Time"', // W8
      chords:[[165,196,247],[196,247,294],[220,262,330],[247,311,370]],
      bass:[1,1.335,1,1.5,1.189,1,0,1], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:95, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,1,0,1,0,0], snare:[0,0,0,0,1,0,0,1], kickVol:.30, snareVol:.25},
    {name:'Satie "Gymnopedie No.1"',        // W9
      chords:[[196,247,294],[147,185,220],[196,247,294],[147,185,220]],
      bass:[1,0,0,0,1.5,0,0,0], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:56, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,0,1,1,0,0,1], snare:[0,0,1,0,0,1,0,0], kickVol:.30, snareVol:.25},
    {name:'Mozart "Eine Kleine Nachtmusik"', // W10
      chords:[[196,247,294],[147,185,220],[165,196,247],[262,330,392]],
      bass:[1,1,1.5,1,1.335,1,1.5,1.189], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:105, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,1,0,0,1,0,1], snare:[0,0,0,1,0,0,1,0], kickVol:.30, snareVol:.25},
    {name:'Tchaikovsky "Swan Lake"',        // W11
      chords:[[247,294,370],[185,233,277],[247,294,370],[165,196,247]],
      bass:[1,0,1.189,0,1,0,1.5,0], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:84, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,1,0,1,0,0,1], snare:[0,1,0,0,1,0,1,0], kickVol:.30, snareVol:.25},
    {name:'Beethoven "Ode to Joy"',         // W12 — triumph
      chords:[[147,185,220],[196,247,294],[220,277,330],[147,185,220]],
      bass:[1,1.189,1.335,1.5,1.335,1.189,1,1], pad:[.55,.25,.45,.25,.55,.25,.85,.25], tempo:100, padVol:.05, bassVol:.60, hihatVol:.11, hihat:[1,0,1,0,1,0,1,0],
      kick:[1,0,1,1,0,1,0,1], snare:[0,1,0,0,1,0,1,0], kickVol:.30, snareVol:.25},
  ];
  let MUSIC_CONFIG=loadMusicConfig();
  let currentProgIdx=0;
  function cloneWaveConfig(cfg){
    return{name:cfg.name,chords:cfg.chords.map(ch=>ch.slice()),bass:cfg.bass.slice(),pad:cfg.pad.slice(),tempo:cfg.tempo,padVol:cfg.padVol,bassVol:cfg.bassVol,hihatVol:cfg.hihatVol,hihat:Array.isArray(cfg.hihat)&&cfg.hihat.length===8?cfg.hihat.slice():[1,0,1,0,1,0,1,0],
      kick:Array.isArray(cfg.kick)&&cfg.kick.length===8?cfg.kick.slice():[1,0,0,0,1,0,0,0],
      snare:Array.isArray(cfg.snare)&&cfg.snare.length===8?cfg.snare.slice():[0,0,0,0,0,0,1,0],
      kickVol:typeof cfg.kickVol==='number'?cfg.kickVol:.30,
      snareVol:typeof cfg.snareVol==='number'?cfg.snareVol:.25};
  }
  function cloneMusicConfig(cfgs){return cfgs.map(cloneWaveConfig)}
  function clampWaveIdx(idx){return Math.max(0,Math.min(DEFAULT_MUSIC_CONFIG.length-1,idx))}
  function sanitizeWaveConfig(raw,fallback){
    const safe=cloneWaveConfig(fallback);
    if(raw&&typeof raw.name==='string'&&raw.name.trim())safe.name=raw.name.trim();
    if(Array.isArray(raw&&raw.chords)&&raw.chords.length===safe.chords.length){
      safe.chords=raw.chords.map((ch,chIdx)=>{
        if(!Array.isArray(ch)||ch.length!==3)return fallback.chords[chIdx].slice();
        return ch.map((note,noteIdx)=>{
          const num=Number(note);
          return Number.isFinite(num)?num:fallback.chords[chIdx][noteIdx];
        });
      });
    }
    if(Array.isArray(raw&&raw.bass)&&raw.bass.length===safe.bass.length){
      safe.bass=raw.bass.map((step,stepIdx)=>{
        const num=Number(step);
        return Number.isFinite(num)?num:fallback.bass[stepIdx];
      });
    }
    if(Array.isArray(raw&&raw.pad)&&raw.pad.length===safe.pad.length){
      safe.pad=raw.pad.map((step,stepIdx)=>{
        const num=Number(step);
        return Number.isFinite(num)?num:fallback.pad[stepIdx];
      });
    }
    if(Number.isFinite(Number(raw&&raw.tempo))){
      safe.tempo=Math.max(50,Math.min(160,Math.round(Number(raw.tempo))));
    }
    // Validate hihat pattern
    if(Array.isArray(raw&&raw.hihat)&&raw.hihat.length===8){
      safe.hihat=raw.hihat.map(v=>(v===1||v===true)?1:0);
    }
    // Validate kick pattern
    if(!Array.isArray(raw&&raw.kick)||raw.kick.length!==8){safe.kick=fallback.kick?fallback.kick.slice():[1,0,0,0,1,0,0,0]}
    else{safe.kick=raw.kick.map(v=>(v===1||v===true)?1:0)}
    // Validate snare pattern
    if(!Array.isArray(raw&&raw.snare)||raw.snare.length!==8){safe.snare=fallback.snare?fallback.snare.slice():[0,0,0,0,0,0,1,0]}
    else{safe.snare=raw.snare.map(v=>(v===1||v===true)?1:0)}
    // Validate kick/snare volumes
    if(typeof(raw&&raw.kickVol)!=='number'||raw.kickVol<0||raw.kickVol>1){safe.kickVol=fallback.kickVol!=null?fallback.kickVol:.30}
    else{safe.kickVol=raw.kickVol}
    if(typeof(raw&&raw.snareVol)!=='number'||raw.snareVol<0||raw.snareVol>1){safe.snareVol=fallback.snareVol!=null?fallback.snareVol:.25}
    else{safe.snareVol=raw.snareVol}
    ['padVol','bassVol','hihatVol'].forEach(k=>{
      if(raw&&Number.isFinite(Number(raw[k])))safe[k]=Math.max(0,Math.min(1,Number(raw[k])));
    });
    return safe;
  }
  function sanitizeMusicConfig(raw){
    if(!Array.isArray(raw)||raw.length!==DEFAULT_MUSIC_CONFIG.length)return null;
    return raw.map((cfg,idx)=>sanitizeWaveConfig(cfg,DEFAULT_MUSIC_CONFIG[idx]));
  }
  function loadMusicConfig(){
    try{
      const saved=localStorage.getItem(MUSIC_STORAGE_KEY);
      if(saved){
        const parsed=sanitizeMusicConfig(JSON.parse(saved));
        if(parsed)return parsed;
      }
    }catch(e){}
    return cloneMusicConfig(DEFAULT_MUSIC_CONFIG);
  }
  function getWaveConfig(idx){
    const waveIdx=clampWaveIdx(idx);
    if(previewConfig&&previewConfig.waveIdx===waveIdx)return previewConfig.config;
    return MUSIC_CONFIG[waveIdx];
  }
  function wc(){
    const cfg=getWaveConfig(currentWaveIdx);
    return cfg.chords[currentProgIdx%cfg.chords.length];
  }

  // ── FM voice creation helpers ──
  function createFmVoice(carrierType,dest){
    const carrier=ctx.createOscillator();
    carrier.type=carrierType||'sine';
    const modulator=ctx.createOscillator();
    modulator.type='sine';
    const modGain=ctx.createGain();
    modGain.gain.value=0;
    const outputGain=ctx.createGain();
    outputGain.gain.value=0;
    // FM: modulator → modGain → carrier.frequency
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(outputGain);
    outputGain.connect(dest);
    carrier.start();
    modulator.start();
    return{carrier,modulator,modGain,outputGain,active:false};
  }
  function createSimpleVoice(carrierType,dest){
    // For kick: no modulator needed, just carrier + output gain
    const carrier=ctx.createOscillator();
    carrier.type=carrierType||'sine';
    const outputGain=ctx.createGain();
    outputGain.gain.value=0;
    carrier.connect(outputGain);
    outputGain.connect(dest);
    carrier.start();
    return{carrier,modulator:null,modGain:null,outputGain,active:false};
  }

  function init(){
    if(ctx)return;
    ctx=new(window.AudioContext||window.webkitAudioContext)();
    masterGain=ctx.createGain();masterGain.gain.value=1;masterGain.connect(ctx.destination);
    // Four buses
    padBus=ctx.createGain();padBus.gain.value=0;padBus.connect(masterGain);
    bassBus=ctx.createGain();bassBus.gain.value=0;bassBus.connect(masterGain);
    sfxBus=ctx.createGain();sfxBus.gain.value=.8;sfxBus.connect(masterGain);
    drumBus=ctx.createGain();drumBus.gain.value=.7;drumBus.connect(masterGain);
    // Pad filter with shimmer LFO
    const padF=ctx.createBiquadFilter();padF.type='lowpass';padF.frequency.value=900;
    padF.connect(padBus);
    const padLFO=ctx.createOscillator();padLFO.type='sine';padLFO.frequency.value=.08;
    const padLG=ctx.createGain();padLG.gain.value=400;padLFO.connect(padLG);padLG.connect(padF.frequency);padLFO.start();
    // Bass filter
    const bassF=ctx.createBiquadFilter();bassF.type='lowpass';bassF.frequency.value=350;bassF.Q.value=4;
    bassF.connect(bassBus);
    const bassLFO=ctx.createOscillator();bassLFO.type='sine';bassLFO.frequency.value=.3;
    const bassLG=ctx.createGain();bassLG.gain.value=120;bassLFO.connect(bassLG);bassLG.connect(bassF.frequency);bassLFO.start();

    // ── Voices 0-2: FM pad (carrier sine + modulator sine, ratio 2, low depth = bell/e-piano) ──
    for(let i=0;i<3;i++){
      const v=createFmVoice('sine',padF);
      const freq=DEFAULT_MUSIC_CONFIG[0].chords[0][i];
      v.carrier.frequency.value=freq;
      v.modulator.frequency.value=freq*2; // ratio 2
      v.modGain.gain.value=freq*0.5; // modIndex 0.5 → gentle bell
      voices.push(v);
    }
    // ── Voice 3: FM bass (carrier sine + modulator sine, ratio 1, modIndex ~2) ──
    {
      const v=createFmVoice('sine',bassF);
      v.carrier.frequency.value=55;
      v.modulator.frequency.value=55; // ratio 1
      v.modGain.gain.value=55*2; // modIndex 2 → warm fat bass
      voices.push(v);
    }
    // ── Voice 4: FM kick (carrier sine, pitch envelope, no modulator) ──
    {
      const v=createSimpleVoice('sine',drumBus);
      v.carrier.frequency.value=55;
      voices.push(v);
    }
    // ── Voice 5: FM snare (carrier + modulator ratio 2.3, inharmonic) ──
    {
      const v=createFmVoice('sine',drumBus);
      v.carrier.frequency.value=200;
      v.modulator.frequency.value=200*2.3;
      v.modGain.gain.value=200*3; // modIndex 3
      voices.push(v);
    }
    // ── Voice 6: FM hihat (carrier ~400Hz + modulator ratio sqrt(2), high depth = metallic) ──
    {
      const v=createFmVoice('sine',drumBus);
      v.carrier.frequency.value=400;
      v.modulator.frequency.value=400*1.414; // sqrt(2) ratio
      v.modGain.gain.value=400*8; // modIndex 8 → metallic
      voices.push(v);
    }
    // ── Voices 7-13: FM SFX pool ──
    for(let i=7;i<14;i++){
      const v=createFmVoice('sine',sfxBus);
      v.carrier.frequency.value=440;
      v.modulator.frequency.value=440*2;
      v.modGain.gain.value=0;
      voices.push(v);
    }

    // ── Voice 14: FM melody (student compose) ──
    melodyBus=ctx.createGain();melodyBus.gain.value=0;melodyBus.connect(masterGain);
    {
      const v=createFmVoice('sine',melodyBus);
      v.carrier.frequency.value=440;
      v.modulator.frequency.value=440*2;
      v.modGain.gain.value=0;
      voices.push(v);
    }

    // Persistent noise source (used for hihat mix-in and snare burst)
    const nBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const nData=nBuf.getChannelData(0);for(let i=0;i<nData.length;i++)nData[i]=Math.random()*2-1;
    const nSrc=ctx.createBufferSource();nSrc.buffer=nBuf;nSrc.loop=true;
    noiseLP=ctx.createBiquadFilter();noiseLP.type='lowpass';noiseLP.frequency.value=3000;
    noiseGate=ctx.createGain();noiseGate.gain.value=0;
    nSrc.connect(noiseLP);noiseLP.connect(noiseGate);noiseGate.connect(sfxBus);
    // Second noise path: bandpass for snare burst, routed through drumBus
    noiseBP=ctx.createBiquadFilter();noiseBP.type='bandpass';noiseBP.frequency.value=2000;noiseBP.Q.value=1.5;
    const noiseBPGate=ctx.createGain();noiseBPGate.gain.value=0;
    nSrc.connect(noiseBP);noiseBP.connect(noiseBPGate);noiseBPGate.connect(drumBus);
    nSrc.start();
    // Store bandpass gate for snare scheduling
    voices._noiseBPGate=noiseBPGate;
  }
  function ensure(){if(!ctx)init();if(ctx.state==='suspended')ctx.resume()}

  // ── FM drum scheduling ──
  function scheduleFmKick(time,vol){
    if(!ctx||!voices[4])return;
    const v=voices[4],t=Math.max(time,ctx.currentTime);
    // Pitch envelope: 150Hz → 55Hz in 60ms
    v.carrier.frequency.cancelScheduledValues(t);
    v.carrier.frequency.setValueAtTime(150,t);
    v.carrier.frequency.exponentialRampToValueAtTime(55,t+0.06);
    // Amplitude: attack 2ms, hold 120ms, decay 80ms
    v.outputGain.gain.cancelScheduledValues(t);
    v.outputGain.gain.setValueAtTime(0,t);
    v.outputGain.gain.linearRampToValueAtTime(vol,t+0.002);
    v.outputGain.gain.setValueAtTime(vol,t+0.122);
    v.outputGain.gain.linearRampToValueAtTime(0,t+0.202);
  }
  function scheduleFmSnare(time,vol){
    if(!ctx||!voices[5])return;
    const v=voices[5],t=Math.max(time,ctx.currentTime);
    // Carrier pitch: 200Hz → 120Hz in 30ms
    v.carrier.frequency.cancelScheduledValues(t);
    v.carrier.frequency.setValueAtTime(200,t);
    v.carrier.frequency.exponentialRampToValueAtTime(120,t+0.03);
    // Modulator: ratio 2.3, modIndex 3, depth decays to 0 in 60ms
    v.modulator.frequency.cancelScheduledValues(t);
    v.modulator.frequency.setValueAtTime(200*2.3,t);
    v.modGain.gain.cancelScheduledValues(t);
    v.modGain.gain.setValueAtTime(200*3,t); // depth = modIndex * carrierFreq
    v.modGain.gain.linearRampToValueAtTime(0,t+0.06);
    // Amplitude: 5ms attack, 100ms decay
    v.outputGain.gain.cancelScheduledValues(t);
    v.outputGain.gain.setValueAtTime(0,t);
    v.outputGain.gain.linearRampToValueAtTime(vol,t+0.005);
    v.outputGain.gain.exponentialRampToValueAtTime(0.001,t+0.105);
    v.outputGain.gain.setValueAtTime(0,t+0.106);
    // Noise burst via bandpass
    if(voices._noiseBPGate){
      const ng=voices._noiseBPGate;
      ng.gain.cancelScheduledValues(t);
      ng.gain.setValueAtTime(vol*0.6,t);
      ng.gain.exponentialRampToValueAtTime(0.001,t+0.1);
      ng.gain.setValueAtTime(0,t+0.101);
    }
  }
  function scheduleFmHihat(time,vol,closed){
    if(!ctx||!voices[6])return;
    const v=voices[6],t=Math.max(time,ctx.currentTime);
    const decay=closed?0.025:0.12;
    // Carrier 400Hz, modulator ratio 1.414, modIndex 8
    v.carrier.frequency.cancelScheduledValues(t);
    v.carrier.frequency.setValueAtTime(400,t);
    v.modulator.frequency.cancelScheduledValues(t);
    v.modulator.frequency.setValueAtTime(400*1.414,t);
    v.modGain.gain.cancelScheduledValues(t);
    v.modGain.gain.setValueAtTime(400*8,t);
    v.modGain.gain.linearRampToValueAtTime(400*2,t+decay);
    // Amplitude
    v.outputGain.gain.cancelScheduledValues(t);
    v.outputGain.gain.setValueAtTime(vol,t);
    v.outputGain.gain.exponentialRampToValueAtTime(0.001,t+decay);
    v.outputGain.gain.setValueAtTime(0,t+decay+0.001);
    // Mix in a little noise (reduced level)
    if(noiseGate&&noiseLP){
      noiseLP.frequency.setValueAtTime(8000,t);
      noiseGate.gain.cancelScheduledValues(t);
      noiseGate.gain.setValueAtTime(vol*0.15,t);
      noiseGate.gain.exponentialRampToValueAtTime(0.001,t+decay);
      noiseGate.gain.setValueAtTime(0,t+decay+0.001);
    }
  }

  function clearBgmAutomation(time){
    if(!ctx)return;
    const t=Math.max(time||ctx.currentTime,ctx.currentTime);
    if(noiseGate){
      noiseGate.gain.cancelScheduledValues(t);
      noiseGate.gain.setValueAtTime(0,t);
    }
    if(noiseLP){
      noiseLP.frequency.cancelScheduledValues(t);
      noiseLP.frequency.setValueAtTime(3000,t);
    }
    if(padBus){
      padBus.gain.cancelScheduledValues(t);
      padBus.gain.setValueAtTime(0,t);
    }
    if(bassBus){
      bassBus.gain.cancelScheduledValues(t);
      bassBus.gain.setValueAtTime(0,t);
    }
    // Clear pad voices (0-2), bass voice (3), kick (4), snare (5), hihat (6)
    for(let i=0;i<7;i++){
      if(!voices[i])continue;
      voices[i].outputGain.gain.cancelScheduledValues(t);
      voices[i].outputGain.gain.setValueAtTime(0,t);
      voices[i].carrier.frequency.cancelScheduledValues(t);
      if(voices[i].modulator){
        voices[i].modulator.frequency.cancelScheduledValues(t);
        voices[i].modGain.gain.cancelScheduledValues(t);
      }
    }
    // Clear melody voice (14) so melody doesn't bleed through pause
    if(voices[14]){
      voices[14].outputGain.gain.cancelScheduledValues(t);
      voices[14].outputGain.gain.setValueAtTime(0,t);
      voices[14].carrier.frequency.cancelScheduledValues(t);
      if(voices[14].modulator){
        voices[14].modulator.frequency.cancelScheduledValues(t);
        voices[14].modGain.gain.cancelScheduledValues(t);
      }
    }
    // Clear noise bandpass gate
    if(voices._noiseBPGate){
      voices._noiseBPGate.gain.cancelScheduledValues(t);
      voices._noiseBPGate.gain.setValueAtTime(0,t);
    }
  }
  function syncCurrentVoicing(restartBgm){
    if(!ctx)return;
    const cfg=getWaveConfig(currentWaveIdx);
    const ch=cfg.chords[currentProgIdx%cfg.chords.length];
    const t=ctx.currentTime;
    for(let i=0;i<3;i++){
      voices[i].carrier.frequency.setTargetAtTime(ch[i],t,.12);
      voices[i].modulator.frequency.setTargetAtTime(ch[i]*2,t,.12); // ratio 2
      voices[i].modGain.gain.setTargetAtTime(ch[i]*0.5,t,.12); // modIndex 0.5
    }
    voices[3].carrier.frequency.setTargetAtTime(ch[0]/4,t,.12);
    voices[3].modulator.frequency.setTargetAtTime(ch[0]/4,t,.12); // ratio 1
    voices[3].modGain.gain.setTargetAtTime((ch[0]/4)*2,t,.12); // modIndex 2
    if(restartBgm&&bgmPlaying){
      stopBGM();
      startBGM();
    }
  }
  function schedulePadStep(level,time,stepDur){
    const t=Math.max(time,ctx.currentTime);
    for(let i=0;i<3;i++){
      if(level<=0){
        voices[i].outputGain.gain.setTargetAtTime(0,t,.02);
        // Settle mod depth low when silent
        voices[i].modGain.gain.setTargetAtTime(0,t,.02);
        continue;
      }
      const peak=level*.75;
      const sustain=Math.max(.02,level*.2);
      const freq=voices[i].carrier.frequency.value||220;
      // Amplitude envelope
      voices[i].outputGain.gain.cancelScheduledValues(t);
      voices[i].outputGain.gain.setValueAtTime(0,t);
      voices[i].outputGain.gain.linearRampToValueAtTime(peak,t+Math.min(stepDur*.18,.05));
      voices[i].outputGain.gain.linearRampToValueAtTime(sustain,t+Math.max(stepDur*.72,.12));
      // FM mod depth envelope: bell attack, softer sustain
      voices[i].modGain.gain.cancelScheduledValues(t);
      voices[i].modGain.gain.setValueAtTime(freq*1.5,t); // high modIndex on attack (bell)
      voices[i].modGain.gain.linearRampToValueAtTime(freq*0.3,t+Math.min(stepDur*.25,.06)); // settle low
    }
  }
  function getPreviewDurationMs(cfg){
    const stepCount=Math.max((cfg.bass||[]).length,(cfg.pad||[]).length,1);
    const stepDur=60/(cfg.tempo||80)/2;
    return Math.ceil(stepCount*stepDur*cfg.chords.length*1000+400);
  }
  function stopPreview(resumeAfter){
    if(previewTimer){clearTimeout(previewTimer);previewTimer=null}
    if(!previewConfig)return;
    const restore=previewConfig;
    previewConfig=null;
    stopBGM();
    currentWaveIdx=restore.previousWaveIdx;
    currentProgIdx=0;
    if(ctx)syncCurrentVoicing(false);
    if(resumeAfter&&restore.resumeAfter&&!muted)startBGM();
  }
  function previewMusicConfig(wave,config){
    if(muted)return false;
    const waveIdx=clampWaveIdx(wave);
    const draft=sanitizeWaveConfig(config||getWaveConfig(waveIdx),DEFAULT_MUSIC_CONFIG[waveIdx]);
    stopPreview(false);
    ensure();
    const resumeAfter=bgmPlaying;
    if(resumeAfter)stopBGM();
    previewConfig={waveIdx:waveIdx,config:draft,previousWaveIdx:currentWaveIdx,resumeAfter:resumeAfter};
    currentWaveIdx=waveIdx;
    currentProgIdx=0;
    syncCurrentVoicing(false);
    startBGM();
    previewTimer=setTimeout(()=>stopPreview(true),getPreviewDurationMs(draft));
    return true;
  }
  function applyMusicConfig(nextConfig,persist){
    const sanitized=sanitizeMusicConfig(nextConfig);
    if(!sanitized)return false;
    stopPreview(false);
    MUSIC_CONFIG=sanitized;
    if(persist){
      try{localStorage.setItem(MUSIC_STORAGE_KEY,JSON.stringify(MUSIC_CONFIG))}catch(e){return false}
    }
    syncCurrentVoicing(true);
    return true;
  }

  // ── FM voice helpers ──
  function playFmNote(freq,dur,ratio,modIndex,vol,del){
    if(muted)return;ensure();
    for(let i=7;i<14;i++){
      if(!voices[i].active){
        const v=voices[i],t=ctx.currentTime+(del||0);
        v.active=true;
        v.carrier.frequency.setValueAtTime(freq,t);
        v.modulator.frequency.setValueAtTime(freq*(ratio||2),t);
        v.modGain.gain.setValueAtTime((modIndex||1)*freq,t);
        // Brief mod depth decay for natural timbre
        v.modGain.gain.setTargetAtTime((modIndex||1)*freq*0.3,t+dur*0.3,.02);
        v.outputGain.gain.setTargetAtTime(vol||.08,t,.005);
        v.outputGain.gain.setTargetAtTime(0,t+dur,.03);
        setTimeout(()=>{v.active=false},((del||0)+dur+.15)*1000);
        return v;
      }
    }
  }
  // Backward-compatible wrapper
  function playNote(freq,dur,type,vol,del){
    // Map old oscillator types to FM ratios/modIndex
    const ratioMap={sine:2,triangle:2,sawtooth:3,square:2};
    const modMap={sine:0.5,triangle:1,sawtooth:2.5,square:2};
    const r=ratioMap[type]||2;
    const mi=modMap[type]||1;
    return playFmNote(freq,dur,r,mi,vol,del);
  }
  function noise(dur,vol,del){
    if(muted||!noiseGate)return;ensure();
    const t=ctx.currentTime+(del||0);
    noiseGate.gain.setTargetAtTime(vol||.1,t,.003);
    noiseGate.gain.setTargetAtTime(0,t+dur,.02);
  }
  // ── Key / chord control ──
  function setKey(wave){
    if(!ctx)return;
    const wIdx=clampWaveIdx((wave||1)-1);
    if(wIdx===currentWaveIdx&&voices[0].outputGain.gain.value>0)return;
    const oldIdx=currentWaveIdx;
    currentWaveIdx=wIdx;
    currentProgIdx=0;
    const ch=getWaveConfig(wIdx).chords[0],t=ctx.currentTime;
    for(let i=0;i<3;i++){
      voices[i].carrier.frequency.setTargetAtTime(ch[i],t,.15);
      voices[i].modulator.frequency.setTargetAtTime(ch[i]*2,t,.15);
      voices[i].modGain.gain.setTargetAtTime(ch[i]*0.5,t,.15);
    }
    voices[3].carrier.frequency.setTargetAtTime(ch[0]/4,t,.15);
    voices[3].modulator.frequency.setTargetAtTime(ch[0]/4,t,.15);
    voices[3].modGain.gain.setTargetAtTime((ch[0]/4)*2,t,.15);
    if(bgmPlaying&&oldIdx!==wIdx){
      const kpv=(getWaveConfig(wIdx).padVol!=null?getWaveConfig(wIdx).padVol:.05)*.5;
      padBus.gain.setTargetAtTime(Math.min(.5,kpv*1.6),t,.05);
      padBus.gain.setTargetAtTime(kpv,t+.4,.3);
      playFmNote(ch[2]*2,.3,2,0.8,.06);
    }
  }
  // Kill melody — plays chord tones on correct answer
  function killMelody(){
    if(!ctx||!bgmPlaying)return;
    const prog=getWaveConfig(currentWaveIdx).chords;
    const ch=prog[currentProgIdx%prog.length];
    playFmNote(ch[2]*2,.4,3,1,.05);
    playFmNote(ch[0]*2,.3,2,0.8,.04,.12);
  }
  // Tree depth drives music layers (0-10 → clamped to 0-5 for layer gating)
  let grooveAlways=false;
  function setTreeDepth(d){
    const v=Math.max(0,d|0);
    musicalHealth=Math.min(5,v);
    grooveAlways=v>=7; // full forest → groove plays even at streak 0
    // Melody volume: audible at depth 7+, louder at 8-10
    if(melodyBus&&ctx){
      const melVol=v>=10?0.045:v>=9?0.04:v>=8?0.035:v>=7?0.025:0;
      melodyBus.gain.setTargetAtTime(melVol,ctx.currentTime,.3);
    }
  }
  // ── Student melody helpers ──
  function midiToFreq(midi){return 440*Math.pow(2,(midi-69)/12)}
  function setMelody(notes){savedMelody=Array.isArray(notes)&&notes.length?notes.slice(0,8):null}
  function clearMelody(){savedMelody=null}
  function getMelody(){return savedMelody?savedMelody.slice():null}
  function playMelodyNote(midi,dur,del){
    // One-shot FM note on voice 14 for compose preview / live playback
    if(muted||!ctx||!voices[14])return;ensure();
    const v=voices[14],t=ctx.currentTime+(del||0);
    const freq=midiToFreq(midi);
    v.carrier.frequency.setValueAtTime(freq,t);
    v.modulator.frequency.setValueAtTime(freq*2,t);
    v.modGain.gain.setValueAtTime(freq*1.5,t); // modIndex 1.5 → bright bell
    v.modGain.gain.setTargetAtTime(freq*0.4,t+(dur||.2)*0.4,.02);
    v.outputGain.gain.setTargetAtTime(.7,t,.005);
    v.outputGain.gain.setTargetAtTime(0,t+(dur||.2),.03);
  }
  function setStreak(n){currentStreak=Math.max(0,n|0);}

  // Opens the filter and shifts voicing as the student progresses

  // ── BGM ──
  function startBGM(){
    if(bgmPlaying||muted)return;ensure();
    if(bgmSeqTimer){clearTimeout(bgmSeqTimer);bgmSeqTimer=null}
    const t=ctx.currentTime;
    clearBgmAutomation(t);
    bgmPlaying=true;
    currentProgIdx=0;
    const waveCfg=getWaveConfig(currentWaveIdx);
    const h=musicalHealth;
    const pv=(waveCfg.padVol!=null?waveCfg.padVol:.05)*.5;
    const bv=(waveCfg.bassVol!=null?waveCfg.bassVol:.6)*.35;
    padBus.gain.setTargetAtTime(h>=5?pv:0,t,.3);
    bassBus.gain.setTargetAtTime(h>=4?bv:0,t,.3);
    for(let i=0;i<3;i++)voices[i].outputGain.gain.setTargetAtTime(0,t,.05);
    voices[3].outputGain.gain.setTargetAtTime(h>=4?.6:0,t,.3);
    let st=60/(getWaveConfig(currentWaveIdx).tempo||80)/2;
    let startT=t;
    function seq(){
      if(!bgmPlaying)return;
      const cfg=getWaveConfig(currentWaveIdx);
      st=60/(cfg.tempo||80)/2;
      const prog=cfg.chords;
      const ch=prog[currentProgIdx%prog.length];
      const h=previewConfig?5:musicalHealth; // preview ignores health
      // Glide pads to current chord (audible if health >= 5)
      for(let i=0;i<3;i++){
        voices[i].carrier.frequency.setTargetAtTime(ch[i],startT,.15);
        voices[i].modulator.frequency.setTargetAtTime(ch[i]*2,startT,.15);
        voices[i].modGain.gain.setTargetAtTime(ch[i]*0.5,startT,.15);
      }
      // Health-gated layer volumes
      const pv=(cfg.padVol!=null?cfg.padVol:.05)*.5;
      const bv=(cfg.bassVol!=null?cfg.bassVol:.6)*.35;
      padBus.gain.setTargetAtTime(h>=5?pv:0,startT,.3);
      bassBus.gain.setTargetAtTime(h>=4?bv:0,startT,.3);
      const bp=cfg.bass||DEFAULT_MUSIC_CONFIG[0].bass;
      const padPattern=cfg.pad||DEFAULT_MUSIC_CONFIG[0].pad;
      const stepCount=Math.max(bp.length,padPattern.length);
      const ll=stepCount*st;
      barStartTime=startT;barLength=ll; // expose for beat playhead
      const now=ctx.currentTime;
      const root=ch[0]/4;
      // Schedule bass notes with FM tracking
      bp.forEach((r,i)=>{
        const nt=startT+i*st;
        if(nt>now-.01){
          const ht=Math.max(nt,now);
          if(r===0){
            voices[3].outputGain.gain.setValueAtTime(0,ht);
          }else{
            const bassFreq=root*r;
            voices[3].outputGain.gain.setValueAtTime(.6,ht);
            voices[3].carrier.frequency.setValueAtTime(bassFreq,ht);
            // Track modulator: ratio 1, modIndex 2 for warmth
            voices[3].modulator.frequency.setValueAtTime(bassFreq,ht);
            // Brief mod depth attack for pluck, then settle
            voices[3].modGain.gain.setValueAtTime(bassFreq*3.5,ht); // high attack
            voices[3].modGain.gain.setTargetAtTime(bassFreq*2,ht+0.02,.01); // settle
          }
        }
      });
      // Step-gate the pads with FM mod depth envelope
      padPattern.forEach((level,i)=>{
        const pt=startT+i*st;
        if(pt>now-.01)schedulePadStep(Math.max(0,Number(level)||0),pt,st);
      });
      // Health-gated drums
      const kickPattern=cfg.kick||[1,0,0,0,1,0,0,0];
      const kickPeak=(cfg.kickVol!=null?cfg.kickVol:.30);
      const snarePattern=cfg.snare||[0,0,0,0,0,0,1,0];
      const snarePeak=(cfg.snareVol!=null?cfg.snareVol:.25);
      const hhPeak=(cfg.hihatVol!=null?cfg.hihatVol:.11)*.25;
      const hhPattern=Array.isArray(cfg.hihat)&&cfg.hihat.length===8?cfg.hihat:[1,0,1,0,1,0,1,0];
      if(h>=3){for(let i=0;i<bp.length;i++){if(!kickPattern[i])continue;const kt=startT+i*st;if(kt>now-.01)scheduleFmKick(kt,kickPeak);}}
      if(h>=2){for(let i=0;i<bp.length;i++){if(!snarePattern[i])continue;const snt=startT+i*st;if(snt>now-.01)scheduleFmSnare(snt,snarePeak);}}
      if(h>=1){for(let i=0;i<bp.length;i++){if(!hhPattern[i])continue;const ht=startT+i*st;if(ht>now-.01)scheduleFmHihat(ht,hhPeak,true);}}
      // Streak groove embellishments (only at full health, skip during preview)
      if(!previewConfig&&h>=5&&(currentStreak>=3||grooveAlways)){
        // Streak 3+: ghost hihats on odd steps (offbeats)
        for(let i=1;i<8;i+=2){
          if(hhPattern[i])continue;
          const ght=startT+i*st;
          if(ght>now-.01)scheduleFmHihat(ght,hhPeak*0.3,true);
        }
      }
      if(!previewConfig&&h>=5&&currentStreak>=5){
        // Streak 5+: ghost snare fill on step 7 (last offbeat before downbeat)
        const fillT=startT+7*st;
        if(fillT>now-.01)scheduleFmSnare(fillT,snarePeak*0.4);
      }
      if(!previewConfig&&h>=5&&currentStreak>=8){
        // Streak 8+: syncopated kicks on steps 3 and 5
        [3,5].forEach(i=>{
          if(kickPattern[i])return;
          const kt=startT+i*st;
          if(kt>now-.01)scheduleFmKick(kt,kickPeak*0.5);
        });
      }
      if(!previewConfig&&h>=5&&currentStreak>=10){
        // Streak 10+: bass passing tones (geometric mean for correct pitch)
        bp.forEach((r,i)=>{
          if(r===0||i>=bp.length-1)return;
          const nextR=bp[(i+1)%bp.length];
          if(nextR===0)return;
          const passFreq=root*Math.sqrt(r*nextR);
          const passT=startT+i*st+st*0.75;
          if(passT>now-.01){
            const pt=Math.max(passT,now);
            voices[3].carrier.frequency.setValueAtTime(passFreq,pt);
            voices[3].modulator.frequency.setValueAtTime(passFreq,pt);
            voices[3].outputGain.gain.setValueAtTime(.3,pt);
          }
        });
      }
      // ── Student melody layer (plays when treeDepth >= 7 and melody exists, muted during compose) ──
      if(!previewConfig&&!melodyMuted&&savedMelody&&musicalHealth>=5){
        const melodyRoot=ch[0]; // current chord root frequency
        const baseRoot=261.63; // C4 reference
        const semitoneShift=12*Math.log2(melodyRoot/baseRoot);
        // Process holds: a note followed by 'hold' slots gets extended duration
        let i=0;
        while(i<savedMelody.length){
          const midi=savedMelody[i];
          if(midi==null||midi==='hold'){i++;continue}
          // Count consecutive holds after this note
          let dur=1;
          while(i+dur<savedMelody.length&&savedMelody[i+dur]==='hold')dur++;
          const mt=startT+i*st;
          if(mt>now-.01){
            const transposedMidi=midi+Math.round(semitoneShift);
            playMelodyNote(transposedMidi,st*dur*.8,mt-ctx.currentTime);
          }
          i+=dur;
        }
      }
      startT+=ll;
      // Auto-advance chord for next bar (song plays itself)
      currentProgIdx=(currentProgIdx+1)%prog.length;
      bgmSeqTimer=setTimeout(seq,ll*1000*.8);
    }
    seq();
  }
  function stopBGM(){
    if(!ctx)return;bgmPlaying=false;
    if(bgmSeqTimer){clearTimeout(bgmSeqTimer);bgmSeqTimer=null}
    const t=ctx.currentTime;
    clearBgmAutomation(t);
  }

  // ── Public API ──
  // Publish
  window.TD_AUDIO={
    toggleMute(){muted=!muted;if(muted)stopBGM();return muted},
    isMuted(){return muted},startBGM,stopBGM,setKey,killMelody,setTreeDepth,setStreak,
    setMelody,clearMelody,getMelody,playMelodyNote,setMelodyMuted(m){melodyMuted=!!m},
    getMusicConfig(wave){return cloneWaveConfig(getWaveConfig(typeof wave==='number'?wave:currentWaveIdx))},
    getAllMusicConfig(){return cloneMusicConfig(MUSIC_CONFIG)},
    getDefaultMusicConfig(){return cloneMusicConfig(DEFAULT_MUSIC_CONFIG)},
    getMusicalHealth(){return musicalHealth},
    getStreak(){return currentStreak},
    getWaveIndex(){return currentWaveIdx},
    getBarStep(){if(!ctx||!bgmPlaying)return-1;const frac=Math.max(0,Math.min(1,(ctx.currentTime-barStartTime)/barLength));return Math.min(7,Math.floor(frac*8))},
    previewMusicConfig,
    stopMusicPreview(){stopPreview(false)},
    saveMusicConfig(nextConfig){return applyMusicConfig(nextConfig,true)},
    resetMusicConfig(){
      stopPreview(false);
      MUSIC_CONFIG=cloneMusicConfig(DEFAULT_MUSIC_CONFIG);
      try{localStorage.removeItem(MUSIC_STORAGE_KEY)}catch(e){}
      syncCurrentVoicing(true);
      return cloneMusicConfig(MUSIC_CONFIG);
    },
    prefix(){playFmNote(1100,.04,2,0.3,.06);playFmNote(1650,.06,2,0.2,.04,.03)},
    hit(intensity=1){
      if(muted)return;ensure();
      const ch=wc();
      // FM bell: carrier at chord freq x2, ratio 3, modIndex 1.5, quick decay
      ch.forEach((f,i)=>{playFmNote(f*2,.2,3,1.5,.07+intensity*.02,i*.06);playFmNote(f*4,.12,3,0.8,.03,i*.06+.03)});
      playFmNote(ch[0]/2,.3,2,0.5,.1+intensity*.05);
    },
    miss(){
      if(muted)return;ensure();
      const ch=wc();
      // FM soft minor second: gentle detuned pair, low modIndex, muted
      ch.forEach(f=>{playFmNote(f*1.02,.15,1.5,1.2,.04);playFmNote(f*.98,.12,1.5,1,.03,.01)});
    },
    breach(){
      if(muted)return;ensure();
      const ch=wc();
      // Low FM growl: carrier at root/2, ratio 7, modIndex 2, 500ms decay
      playFmNote(ch[0]/2,.5,7,2,.15);
      ch.forEach((f,i)=>playFmNote(f*.7,.35,3,2.5,.07,i*.05));
      noise(.3,.1,.1);
    },
    waveClear(){
      if(muted)return;ensure();
      const nw=clampWaveIdx(currentWaveIdx+1);
      const nc=getWaveConfig(nw).chords[0];
      // FM arpeggio: ascending chord tones with ratio 3, modIndex 1, like bells
      nc.forEach((f,i)=>{playFmNote(f*2,.25,3,1,.08,i*.1);playFmNote(f*4,.15,3,0.5,.04,i*.1+.05)});
      // Full chord shimmer
      setTimeout(()=>nc.forEach(f=>playFmNote(f*2,.3,3,0.8,.04)),350);
    },
    victory(){
      if(muted)return;ensure();stopBGM();
      // Full ascending FM arpeggio with longer sustain
      [262,330,392,494,523,659,784].forEach((f,i)=>{
        playFmNote(f,.4,3,1.2,.06,i*.07);playFmNote(f*1.25,.35,2,0.8,.03,i*.07);playFmNote(f*1.5,.35,2,0.6,.03,i*.07);
      });
    },
    gameOver(){
      if(muted)return;ensure();stopBGM();
      [400,340,280,220,160].forEach((f,i)=>{
        playFmNote(f,.35,3,3,.06,i*.14);playFmNote(f*1.2,.35,1.5,2,.04,i*.14);
      });
      noise(.8,.06,.6);
    },
    spawn(){playFmNote(165,.1,2,0.8,.05);playFmNote(220,.08,2,0.5,.03,.02)},
    select(){playFmNote(880,.05,2,0.3,.06);playFmNote(1320,.04,2,0.2,.04,.02)},
    click(){const ch=wc();ch.forEach(f=>playFmNote(f*2,.06,2,0.5,.04))},
    combo(){
      if(muted)return;ensure();
      const ch=wc();
      // Quick bright FM chirp
      ch.forEach((f,i)=>playFmNote(f*2,.15,3,1.5,.06,i*.04));
      playFmNote(ch[2]*4,.1,3,1,.04,.15);
    },
    split(){
      if(muted)return;ensure();
      const ch=wc();
      ch.forEach(f=>playFmNote(f*1.414,.15,2.0,1.5,.05));
    }
  };

})();
