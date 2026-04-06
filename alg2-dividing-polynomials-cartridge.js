(function(){
function shuffleArr(arr){
  const out=arr.slice();
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
function replaceFirstLiteral(text,token,replacement){
  if(!text||!token)return null;
  const idx=text.indexOf(token);
  if(idx===-1)return null;
  return text.slice(0,idx)+replacement+text.slice(idx+token.length);
}
function replaceFirstRegexMatch(text,regex,replacement){
  if(!text||!regex)return null;
  const match=text.match(regex);
  if(!match||match.index==null)return null;
  return text.slice(0,match.index)+replacement+text.slice(match.index+match[0].length);
}
function stripAnswerLabel(label){
  return String(label||'').replace(/\s*\([^)]*\)\s*$/,'').trim();
}
function ensureSentence(text){
  const trimmed=String(text||'').trim();
  if(!trimmed)return'';
  return /[.!?]$/.test(trimmed)?trimmed:trimmed+'.';
}
function formatExplanationLabel(label){
  return String(label||'')
    .replace(/\\text\{([^}]*)\}/g,'$1')
    .replace(/\\left/g,'')
    .replace(/\\right/g,'')
    .replace(/\\cdot/g,' ')
    .replace(/\\times/g,' ')
    .replace(/\\quad/g,' ')
    .replace(/\\qquad/g,' ')
    .replace(/\\implies/g,' implies ')
    .replace(/[{}]/g,'')
    .replace(/\s+/g,' ')
    .trim();
}
function normalizeExplanationLookup(label){
  const raw=formatExplanationLabel(label)
    .toLowerCase()
    .replace(/\s+/g,'')
    .replace(/[\\{}_]/g,'')
    .replace(/−/g,'-');
  const aliases={
    'qx':'q(x)',
    'q(x)':'q(x)',
    'px':'p(x)',
    'p(x)':'p(x)',
    'dx':'d(x)',
    'd(x)':'d(x)',
    'rx':'r(x)',
    'r(x)':'r(x)',
    'pc':'p(c)',
    'p(c)':'p(c)',
    'xc':'(x-c)',
    '(x-c)':'(x-c)',
    'multiplythenadd':'multiplythenadd'
  };
  return aliases[raw]||raw;
}
function normalizeBlankConcept(value){
  return normalizeExplanationLookup(formatExplanationLabel(String(value||'')));
}
function buildAutoBlankVariants(cmd){
  if(!cmd||!cmd.latex)return[];
  const seenConcepts=new Set((cmd.blanks||[]).map(blank=>normalizeBlankConcept(blank.answer)));
  const seenLatex=new Set((cmd.blanks||[]).map(blank=>blank.latex));
  const variants=[];
  for(const spec of AUTO_BLANK_SPECS){
    const answer=spec.answer||spec.match;
    const conceptKey=normalizeBlankConcept(answer);
    if(seenConcepts.has(conceptKey))continue;
    const blankLatex=spec.match
      ?replaceFirstLiteral(cmd.latex,spec.match,'\\boxed{\\,?\\,}')
      :replaceFirstRegexMatch(cmd.latex,spec.regex,'\\boxed{\\,?\\,}');
    if(!blankLatex||blankLatex===cmd.latex||seenLatex.has(blankLatex))continue;
    variants.push({latex:blankLatex,answer:answer,choices:spec.choices.slice(0,3)});
    seenConcepts.add(conceptKey);
    seenLatex.add(blankLatex);
    if(variants.length>=3)break;
  }
  return variants;
}
function expandFormulaBlankCoverage(cartridge){
  cartridge.commands.forEach(cmd=>{
    if(!Array.isArray(cmd.blanks))cmd.blanks=[];
    cmd.blanks=cmd.blanks.concat(buildAutoBlankVariants(cmd));
  });
}
function buildGlossaryEntry(spec){
  return{title:spec.title,lines:spec.lines.map(ensureSentence)};
}
function buildExplanationBank(commands){
  const byId={},byLabel={};
  commands.forEach(cmd=>{
    const label=stripAnswerLabel(cmd.action);
    const entry={
      id:cmd.id,
      title:label,
      lines:[
        ensureSentence(cmd.explain||(`${label} is an Algebra 2 idea from this deck`)),
        ensureSentence('Use it when the question is asking for the '+label.toLowerCase()),
        ensureSentence('Spot it by remembering: '+cmd.hint)
      ]
    };
    byId[cmd.id]=entry;
    byLabel[normalizeExplanationLookup(label)]=entry;
  });
  EXPLANATION_GLOSSARY.forEach(spec=>{
    const entry=buildGlossaryEntry(spec);
    spec.keys.forEach(key=>{byLabel[normalizeExplanationLookup(key)]=entry;});
  });
  return{byId,byLabel};
}

const ALG2_POLYNOMIALS_CARTRIDGE={
  id:'alg2-dividing-polynomials',
  name:'Algebra 2 Dividing Polynomials',
  description:'Formula defense for Algebra 2 polynomial division methods and theorems',
  icon:'/',
  inputMode:'quiz',
  prefixLabel:null,
  title:'ALGEBRA 2',
  subtitle:'DIVIDING POLYNOMIALS',
  startButton:'DEPLOY',
  instructions:'Enemies carry polynomial-division ideas in LaTeX.<br><b>Identify</b>: pick the matching method or theorem.<br><b>Fill-blank</b>: pick the missing symbol, value, or step.',
  instructionsSub:'Long division, synthetic division, remainder, and factor ideas in one deck.<br>Alt+E = explain / watch / close',
  commands:[
    {id:'long-division',action:'Polynomial Long Division',tier:'core',dom:'division-methods',
      hint:'Divide, multiply, subtract, bring down - repeat',
      explain:'Systematically divides a polynomial by another polynomial to produce a quotient and remainder.',
      latex:'\\frac{x^3 + x^2 - 2x + 14}{x + 3} = x^2 - 2x + 4 + \\frac{2}{x+3}',
      blanks:[
        {latex:'\\frac{x^3 + x^2 - 2x + 14}{x + 3} = \\boxed{\\,?\\,} - 2x + 4 + \\frac{2}{x+3}',answer:'x^2',choices:['x^2','x^3','2x']},
        {latex:'\\frac{x^3 + x^2 - 2x + 14}{x + 3} = x^2 - 2x + 4 + \\frac{\\boxed{\\,?\\,}}{x+3}',answer:'2',choices:['2','14','-2']},
        {latex:'\\frac{x^3 + x^2 - 2x + 14}{x + 3} = x^2 - 2x + 4 + \\frac{2}{\\boxed{\\,?\\,}}',answer:'x+3',choices:['x+3','x-3','x']},
        {latex:'\\frac{x^3 + x^2 - 2x + 14}{x + 3} = x^2 - 2x + \\boxed{\\,?\\,} + \\frac{2}{x+3}',answer:'4',choices:['4','-8','10']}
      ],
      subconcepts:[
        {q:'What is the first step of polynomial long division?',correct:'Divide the leading term of the dividend by the leading term of the divisor',wrong:['Multiply the entire dividend by the divisor','Subtract the divisor from the dividend']},
        {q:'When do you stop the long division process?',correct:'When the remainder degree is less than the divisor degree',wrong:['When the remainder is 0','After exactly n steps where n is the dividend degree']},
        {q:'How is the final answer expressed?',correct:'Quotient plus remainder over divisor',wrong:['Just the quotient','Quotient times divisor plus remainder']}
      ]},
    {id:'synthetic-division',action:'Synthetic Division',tier:'core',dom:'division-methods',
      hint:'Bring down, multiply by c, add - repeat',
      explain:'A coefficient shortcut for dividing by a linear binomial of the form x-c.',
      latex:'\\begin{array}{c|cccc} c & a_n & a_{n-1} & \\cdots & a_0 \\end{array}',
      blanks:[
        {latex:'\\text{For }(x-2),\\text{ use }\\boxed{\\,?\\,}\\text{ in the synthetic box}',answer:'2',choices:['2','-2','0']},
        {latex:'\\text{The last number in the bottom row is the }\\boxed{\\,?\\,}',answer:'remainder',choices:['\\text{remainder}','\\text{leading coefficient}','\\text{divisor}']},
        {latex:'\\text{At each column you }\\boxed{\\,?\\,}',answer:'multiply then add',choices:['\\text{multiply then add}','\\text{multiply then subtract}','\\text{divide then add}']}
      ],
      subconcepts:[
        {q:'When dividing by (x + 2) using synthetic division, what value goes in the box?',correct:'-2',wrong:['2','+2']},
        {q:'If the polynomial is missing an x^2 term, what coefficient must you insert?',correct:'0 as a placeholder',wrong:['Skip that column','1 as a placeholder']},
        {q:'What is the degree of the quotient relative to the dividend?',correct:'One degree less than the dividend',wrong:['Same degree','Two degrees less']}
      ]},
    {id:'division-algorithm',action:'Division Algorithm Identity',tier:'core',dom:'division-methods',
      hint:'Dividend = divisor times quotient plus remainder',
      explain:'Organizes every polynomial division result into one identity connecting dividend, divisor, quotient, and remainder.',
      latex:'P(x) = D(x)Q(x) + R(x)',
      blanks:[
        {latex:'P(x) = D(x)Q(x) + \\boxed{\\,?\\,}',answer:'R(x)',choices:['R(x)','Q(x)','D(x)']},
        {latex:'\\boxed{\\,?\\,} = D(x)Q(x) + R(x)',answer:'P(x)',choices:['P(x)','Q(x)','R(x)']},
        {latex:'\\deg(R(x)) < \\deg(\\boxed{\\,?\\,})',answer:'D(x)',choices:['D(x)','Q(x)','P(x)']}
      ],
      subconcepts:[
        {q:'In P(x)=D(x)Q(x)+R(x), what does Q(x) represent?',correct:'The quotient after you divide P(x) by D(x)',wrong:['The divisor you divide by','The original dividend polynomial']},
        {q:'What restriction must the remainder satisfy?',correct:'Its degree must be less than the divisor degree',wrong:['Its degree must match the quotient degree','It must always be 0']},
        {q:'How can you verify a division result?',correct:'Check that dividend equals divisor times quotient plus remainder',wrong:['Add the divisor and quotient only','Square the quotient and compare']}
      ]},
    {id:'remainder-theorem',action:'Remainder Theorem',tier:'core',dom:'theorems',
      hint:'When dividing by x-c, the remainder is P(c)',
      explain:'Finds the remainder from a linear divisor by evaluating the polynomial instead of doing full division.',
      latex:'P(x) \\div (x-c) \\implies R = P(c)',
      blanks:[
        {latex:'P(x) \\div (x-c) \\implies R = \\boxed{\\,?\\,}',answer:'P(c)',choices:['P(c)','Q(c)','R(x)']},
        {latex:'P(x) \\div (x-4) \\implies \\text{R} = P(\\boxed{\\,?\\,})',answer:'4',choices:['4','-4','0']},
        {latex:'P(x) \\div (x+2) \\implies \\text{R} = P(\\boxed{\\,?\\,})',answer:'-2',choices:['-2','2','0']}
      ],
      subconcepts:[
        {q:'To find the remainder when dividing by (x-c), what value do you evaluate?',correct:'Evaluate P(c)',wrong:['Evaluate Q(c)','Set P(x)=0 first']},
        {q:'If the divisor is (x+2), what value of c do you use?',correct:'-2 because x+2 = x-(-2)',wrong:['2 because the sign stays the same','0 because the divisor is linear']},
        {q:'Why is the Remainder Theorem faster than full division?',correct:'It replaces the division work with substitution and evaluation',wrong:['It only works when the remainder is 0','It gives the quotient directly']}
      ]},
    {id:'factor-theorem',action:'Factor Theorem',tier:'core',dom:'theorems',
      hint:'(x-c) is a factor exactly when P(c)=0',
      explain:'Turns a zero remainder into a factor test for a linear binomial.',
      latex:'P(c)=0 \\iff (x-c)\\text{ is a factor of }P(x)',
      blanks:[
        {latex:'P(c)=\\boxed{\\,?\\,} \\iff (x-c)\\text{ is a factor of }P(x)',answer:'0',choices:['0','1','c']},
        {latex:'P(c)=0 \\iff \\boxed{\\,?\\,}\\text{ is a factor of }P(x)',answer:'(x-c)',choices:['(x-c)','(x+c)','Q(x)']},
        {latex:'\\text{If }(x-3)\\text{ divides }P(x),\\text{ then }P(\\boxed{\\,?\\,})=0',answer:'3',choices:['3','-3','0']}
      ],
      subconcepts:[
        {q:'If P(c)=0, what does that tell you about (x-c)?',correct:'It means (x-c) is a factor of P(x)',wrong:['It means (x-c) is the quotient','It means the divisor has degree 0']},
        {q:'If P(c) != 0, what can you conclude about (x-c)?',correct:'It is NOT a factor of P(x)',wrong:['It is still a factor','Cannot determine']},
        {q:'How is the Factor Theorem related to the Remainder Theorem?',correct:'It is the special case where the remainder equals 0',wrong:['They are completely unrelated','Factor Theorem works for quadratic divisors']}
      ]},
    {id:'factor-with-division',action:'Factoring via Division',tier:'regular',dom:'theorems',
      hint:'If x-c divides evenly, divide to find the cofactor',
      explain:'After a linear factor is known, divide it out to express the polynomial as a product.',
      latex:'P(x) = (x-c) \\cdot Q(x) \\quad \\text{where } P(c) = 0',
      blanks:[
        {latex:'P(x) = (x-c) \\cdot \\boxed{\\,?\\,}',answer:'Q(x)',choices:['Q(x)','P(x)','R(x)']},
        {latex:'P(c) = \\boxed{\\,?\\,}',answer:'0',choices:['0','1','c']},
        {latex:'P(x) = \\boxed{\\,?\\,} \\cdot Q(x)',answer:'(x-c)',choices:['(x-c)','(x+c)','Q(x)']}
      ],
      subconcepts:[
        {q:'After confirming (x+2) is a factor of P(x), what is the next step?',correct:'Divide P(x) by (x+2) to find the quotient Q(x)',wrong:['Multiply P(x) by (x+2)','Evaluate P(2)']},
        {q:'If P(x) is degree 3 and (x-c) is a factor, what degree is the quotient/cofactor Q(x)?',correct:'One degree less: degree 2 (quadratic)',wrong:['Degree 3','Degree 1']},
        {q:'How do you express P(x) as a product?',correct:'P(x) = (x - c) * Q(x)',wrong:['P(x) = Q(x) + R(x)','P(x) = (x-c) + Q(x)']}
      ]}
  ],

  generateQuestion(cmd,allCommands){
    const diff=G.difficulty||'learn';
    const baseW={learn:{identify:0.40,fillblank:0.25,variable:0.15,application:0.10,relationship:0.10},
      practice:{identify:0.15,fillblank:0.45,variable:0.10,application:0.15,relationship:0.15},
      challenge:{identify:0.05,fillblank:0.45,variable:0.10,application:0.20,relationship:0.20}};
    const bw=baseW[diff]||baseW.learn;
    const w={identify:bw.identify};
    if(cmd.blanks&&cmd.blanks.length>0)w.fillblank=bw.fillblank;
    if(this.variableBank[cmd.id]?.length>0)w.variable=bw.variable;
    if(this.applicationBank[cmd.id]?.length>0)w.application=bw.application;
    if(this.relationshipBank[cmd.id]?.length>0)w.relationship=bw.relationship;
    const total=Object.values(w).reduce((a,b)=>a+b,0);
    let roll=Math.random()*total,type='identify';
    for(const[k,v]of Object.entries(w)){roll-=v;if(roll<=0){type=k;break;}}

    function stripNot(s){return s.replace(/\s*\([^)]*\)\s*$/,'').trim();}

    if(type==='variable'){
      const vars=this.variableBank[cmd.id];
      const v=vars[Math.floor(Math.random()*vars.length)];
      const allDescs=[];
      for(const id of Object.keys(this.variableBank)){
        if(id===cmd.id)continue;
        this.variableBank[id].forEach(vv=>{if(vv.d!==v.d&&!allDescs.includes(vv.d))allDescs.push(vv.d);});
      }
      const distractors=shuffleArr(allDescs).slice(0,3);
      const options=shuffleArr([v.d,...distractors]);
      const correctIdx=options.indexOf(v.d);
      return{type:'variable',latex:cmd.latex,symbol:v.s,options,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }
    if(type==='application'){
      const bank=this.applicationBank[cmd.id];
      const entry=bank[Math.floor(Math.random()*bank.length)];
      const correctLabel=stripNot(cmd.action);
      const picks=[];const usedTexts=new Set([correctLabel.toLowerCase()]);
      if(entry.confusionSet){
        for(const cid of shuffleArr(entry.confusionSet.slice())){
          if(picks.length>=3)break;
          const c=allCommands.find(cc=>cc.id===cid);
          if(c){
            const text=stripNot(c.action);
            if(!usedTexts.has(text.toLowerCase())){picks.push(text);usedTexts.add(text.toLowerCase());}
          }
        }
      }
      for(const c of shuffleArr(allCommands.filter(c=>c.id!==cmd.id&&c.dom===cmd.dom))){
        if(picks.length>=3)break;
        const text=stripNot(c.action);
        if(!usedTexts.has(text.toLowerCase())){picks.push(text);usedTexts.add(text.toLowerCase());}
      }
      for(const c of shuffleArr(allCommands.filter(c=>c.id!==cmd.id))){
        if(picks.length>=3)break;
        const text=stripNot(c.action);
        if(!usedTexts.has(text.toLowerCase())){picks.push(text);usedTexts.add(text.toLowerCase());}
      }
      const options=shuffleArr([correctLabel,...picks.slice(0,3)]);
      const correctIdx=options.indexOf(correctLabel);
      return{type:'application',scenario:entry.scenario,options,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }
    if(type==='relationship'){
      const bank=this.relationshipBank[cmd.id];
      const entry=bank[Math.floor(Math.random()*bank.length)];
      const correct=entry.direction.charAt(0).toUpperCase()+entry.direction.slice(1);
      const options=shuffleArr(['Increases','Decreases','Stays the same']);
      const correctIdx=options.indexOf(correct);
      return{type:'relationship',latex:cmd.latex,input:entry.input,output:entry.output,direction:correct,explain:entry.explain,formulaName:stripNot(cmd.action),options,correctIdx,correctKey:['a','b','c'][correctIdx]};
    }
    if(type==='identify'){
      const sameDom=allCommands.filter(c=>c.id!==cmd.id&&c.dom===cmd.dom);
      const diffDom=allCommands.filter(c=>c.id!==cmd.id&&c.dom!==cmd.dom);
      const pool=[...sameDom,...shuffleArr(diffDom)];
      const correctLabel=stripNot(cmd.action);
      const picks=[];const usedTexts=new Set([correctLabel.toLowerCase()]);
      for(const c of shuffleArr(pool)){
        if(picks.length>=3)break;
        const text=stripNot(c.action);
        if(!usedTexts.has(text.toLowerCase())){picks.push(text);usedTexts.add(text.toLowerCase());}
      }
      for(const c of shuffleArr(allCommands.filter(c=>c.id!==cmd.id))){
        if(picks.length>=3)break;
        const text=stripNot(c.action);
        if(!usedTexts.has(text.toLowerCase())){picks.push(text);usedTexts.add(text.toLowerCase());}
      }
      const options=shuffleArr([correctLabel,...picks.slice(0,3)]);
      const correctIdx=options.indexOf(correctLabel);
      return{type:'identify',latex:cmd.latex,options,correctIdx,correctKey:['a','b','c','d'][correctIdx]};
    }
    const blank=cmd.blanks[Math.floor(Math.random()*cmd.blanks.length)];
    const shuffledChoices=shuffleArr(blank.choices.slice());
    const correctIdx=shuffledChoices.indexOf(blank.choices[0]);
    return{type:'fillblank',latex:blank.latex,answer:blank.answer,choices:shuffledChoices,correctIdx,fullLatex:cmd.latex};
  },

  formatPrompt(cmd){return cmd.action;},
  formatAnswer(cmd){return cmd.latex?'(formula)':cmd.action;},

  validateBlank(input,answer){
    function norm(s){
      return formatExplanationLabel(String(s||''))
        .trim()
        .toLowerCase()
        .replace(/\s+/g,'')
        .replace(/[\\{}_]/g,'')
        .replace(/\^/g,'')
        .replace(/−/g,'-');
    }
    const aliases={
      'xbar':'x-bar',
      'phat':'p-hat',
      'multiplythenadd':'multiplythenadd'
    };
    const ni=norm(input),na=norm(answer);
    return ni===na||aliases[ni]===na||aliases[na]===ni;
  }
};

const VARIABLE_BANK={
  'long-division':[
    {s:'P(x)',d:'the dividend polynomial being divided'},
    {s:'D(x)',d:'the divisor you divide by'},
    {s:'Q(x)',d:'the quotient polynomial result'}
  ],
  'synthetic-division':[
    {s:'c',d:'the root value used for the linear divisor x-c'},
    {s:'a_n',d:'the leading coefficient of the dividend'},
    {s:'R',d:'the last entry in the bottom row, the remainder'}
  ],
  'division-algorithm':[
    {s:'P(x)',d:'the dividend polynomial'},
    {s:'D(x)',d:'the divisor polynomial'},
    {s:'Q(x)',d:'the quotient polynomial'},
    {s:'R(x)',d:'the remainder polynomial'}
  ],
  'remainder-theorem':[
    {s:'c',d:'the value substituted into P(x) to find the remainder'},
    {s:'P(c)',d:'the remainder when dividing by x-c'}
  ],
  'factor-theorem':[
    {s:'(x-c)',d:'the linear binomial being tested'},
    {s:'0',d:'the remainder value that confirms a factor'}
  ],
  'factor-with-division':[
    {s:'Q(x)',d:'the cofactor, or quotient after dividing out the known factor'},
    {s:'(x-c)',d:'the known linear factor'},
    {s:'P(x)',d:'the original polynomial being factored'}
  ]
};

const APPLICATION_BANK={
  'long-division':[
    {
      scenario:'A cubic expression must be divided by a linear binomial, and the result has to be written as a quotient plus a remainder fraction.',
      confusionSet:['synthetic-division','division-algorithm','remainder-theorem']
    },
    {
      scenario:'You need to simplify (x^3 + 2x^2 - 5x + 1)/(x - 1) and present the result as a new expression plus a fraction.',
      confusionSet:['synthetic-division','factor-with-division','division-algorithm']
    }
  ],
  'synthetic-division':[
    {
      scenario:'You want a fast coefficient-table shortcut for dividing a degree-4 expression by (x - 3) and reading off the quotient and remainder.',
      confusionSet:['long-division','remainder-theorem','division-algorithm']
    },
    {
      scenario:'Morgan sets up a table with the divisor root and the polynomial coefficients to compute the bottom-row coefficients.',
      confusionSet:['long-division','remainder-theorem','factor-theorem']
    }
  ],
  'division-algorithm':[
    {
      scenario:'You want to verify that your work is correct by checking that dividend equals divisor times quotient plus remainder.',
      confusionSet:['remainder-theorem','long-division','factor-theorem']
    }
  ],
  'remainder-theorem':[
    {
      scenario:'Without carrying out full division, you need the leftover value from dividing a polynomial by a linear binomial.',
      confusionSet:['factor-theorem','synthetic-division','long-division']
    },
    {
      scenario:'A teacher asks you to compare the leftover from a divisor with the value you get from direct substitution.',
      confusionSet:['factor-theorem','division-algorithm','factor-with-division']
    }
  ],
  'factor-theorem':[
    {
      scenario:'You need to decide whether a linear binomial divides a polynomial evenly, without actually dividing.',
      confusionSet:['remainder-theorem','factor-with-division','synthetic-division']
    }
  ],
  'factor-with-division':[
    {
      scenario:'You already know (x+2) divides a cubic evenly, and now you need the quadratic that completes the product form.',
      confusionSet:['factor-theorem','long-division','synthetic-division']
    },
    {
      scenario:'After confirming P(c)=0, you need to rewrite P(x) as a product of two polynomial factors.',
      confusionSet:['factor-theorem','remainder-theorem','division-algorithm']
    }
  ]
};

const RELATIONSHIP_BANK={
  'division-algorithm':[
    {
      input:'Degree of D(x)',
      output:'Maximum degree of R(x)',
      direction:'increases',
      explain:'The remainder degree must stay strictly less than the divisor degree.'
    }
  ],
  'long-division':[
    {
      input:'Degree of the dividend',
      output:'Number of division steps required',
      direction:'increases',
      explain:'Each long-division step removes one leading power until the remainder degree is smaller than the divisor degree.'
    }
  ],
  'remainder-theorem':[
    {
      input:'Value of c in P(c)',
      output:'Remainder when dividing by x-c',
      direction:'increases',
      explain:'Changing c changes the substitution point, so it changes the remainder value P(c).'
    }
  ],
  'factor-theorem':[
    {
      input:'P(c), the evaluated result',
      output:'Whether x-c is a factor',
      direction:'decreases',
      explain:'As P(c) moves to 0, x-c moves toward being a factor; at exactly 0, it is a factor.'
    }
  ]
};

const EXPLANATION_GLOSSARY=[
  {keys:['p(x)'],title:'P(x)',lines:[
    'P(x) names the original polynomial being studied',
    'Use it for the dividend or for the polynomial you evaluate at c',
    'Spot it as the starting expression before division or factor testing'
  ]},
  {keys:['d(x)'],title:'D(x)',lines:[
    'D(x) is the divisor polynomial',
    'Use it for the expression you divide by in the division algorithm',
    'Spot it as the denominator or binomial outside the long-division bracket'
  ]},
  {keys:['q(x)'],title:'Q(x)',lines:[
    'Q(x) is the quotient, or cofactor, that remains after division',
    'Use it when the problem asks for the quotient or the factor left after dividing out x-c',
    'Spot it as the polynomial multiplied by the divisor in P(x)=D(x)Q(x)+R(x)'
  ]},
  {keys:['r(x)'],title:'R(x)',lines:[
    'R(x) is the remainder term left after division',
    'Use it when the division algorithm asks what is left over after the divisor no longer fits',
    'Spot it as the final add-on in P(x)=D(x)Q(x)+R(x)'
  ]},
  {keys:['p(c)'],title:'P(c)',lines:[
    'P(c) means evaluate the polynomial at the specific value c',
    'Use it to find a remainder quickly when the divisor is x-c',
    'Spot it as the bridge between substitution and the Remainder Theorem'
  ]},
  {keys:['(x-c)'],title:'(x-c)',lines:[
    'x-c is the linear binomial tied to the value c',
    'Use it when testing or dividing out a possible linear factor',
    'Spot the sign carefully because x+3 means c=-3'
  ]},
  {keys:['0'],title:'0',lines:[
    'Zero is the special remainder that proves a divisor goes in evenly',
    'Use it to confirm factor status in the Factor Theorem',
    'Spot it as the target value for P(c) when x-c is a true factor'
  ]},
  {keys:['2'],title:'2',lines:[
    'Here 2 is a concrete value from the division work',
    'Use it as a remainder or as the synthetic-box value when the divisor is x-2',
    'Spot it as the leftover constant after the algebra is finished'
  ]},
  {keys:['3'],title:'3',lines:[
    'Here 3 is the c-value tied to the factor x-3',
    'Use it when substituting into P(c) for a divisor or factor of the form x-3',
    'Spot it by flipping the sign from x-c back to c'
  ]},
  {keys:['4'],title:'4',lines:[
    'Here 4 is a final numeric result from the quotient or substitution step',
    'Use it as the constant quotient term or as the c-value from x-4',
    'Spot it as a finished output rather than a new variable'
  ]},
  {keys:['-2'],title:'-2',lines:[
    'Negative two is the c-value for the divisor x+2',
    'Use it in the synthetic box or in P(c) after rewriting x+2 as x-(-2)',
    'Spot it as the classic sign-flip trap in this lesson'
  ]},
  {keys:['x^2'],title:'x squared',lines:[
    'x squared is the leading quotient term in the sample long division',
    'Use it after dividing the leading term x^3 by x',
    'Spot it as the first term placed in the quotient'
  ]},
  {keys:['x+3'],title:'x + 3',lines:[
    'x+3 is the divisor in the sample fraction form',
    'Use it in the remainder-over-divisor part of the final answer',
    'Spot it as the same binomial you started with in the denominator'
  ]},
  {keys:['remainder'],title:'Remainder',lines:[
    'The remainder is what is left after the divisor no longer fits',
    'Use it as the last number in synthetic division or the leftover term in long division',
    'Spot it as the value attached to the divisor in the final fraction or identity'
  ]},
  {keys:['multiply then add'],title:'Multiply then add',lines:[
    'Multiply then add is the repeating move in synthetic division',
    'Use it after bringing down the first coefficient',
    'Spot it as the pattern that creates the next bottom-row entry'
  ]},
  {keys:['long division','polynomial long division'],title:'Long Division',lines:[
    'Long division is the systematic algorithm for dividing polynomials',
    'Use it for any divisor, not just linear ones',
    'Spot it by the divide, multiply, subtract, bring down cycle'
  ]},
  {keys:['synthetic division','synthetic'],title:'Synthetic Division',lines:[
    'Synthetic division is a shortcut that uses only coefficients',
    'Use it only when the divisor is a linear binomial x-c',
    'Spot it by the boxed c value and the multiply-then-add row work'
  ]},
  {keys:['cofactor','q(x) cofactor'],title:'Cofactor Q(x)',lines:[
    'The cofactor is the quotient left after dividing out a known factor',
    'Use it when rewriting P(x) as (x-c) times another polynomial',
    'Spot it as the remaining factor after x-c is removed'
  ]},
  {keys:['placeholder','zero coefficient','missing term'],title:'Zero Placeholder',lines:[
    'A zero placeholder keeps every power of x in the correct position',
    'Use it whenever a term is missing in long or synthetic division',
    'Spot it as the fix that prevents shifted coefficients'
  ]}
];

const AUTO_BLANK_SPECS=[
  {match:'Q(x)',choices:['Q(x)','R(x)','D(x)']},
  {match:'R(x)',choices:['R(x)','Q(x)','P(x)']},
  {match:'D(x)',choices:['D(x)','P(x)','Q(x)']},
  {match:'P(c)',choices:['P(c)','P(x)','0']},
  {regex:/(?<![_\w])0(?![_\w.])/u,answer:'0',choices:['0','1','c']}
];

const DOM_LABELS={
  'division-methods':['Lesson 3-4 - Division Methods'],
  'theorems':['Lesson 3-4 - Division Theorems']
};

const SHARED_PREREQ_NODES={
  'eval-poly':{
    id:'eval-poly',type:'conceptual',level:2,
    q:'What does it mean to evaluate P(c)?',
    correct:'Substitute c for x and simplify',
    wrong:['Divide by c','Set P(x)=0 automatically'],
    prereqs:[]
  },
  'poly-degree':{
    id:'poly-degree',type:'conceptual',level:2,
    q:'What does the degree of a polynomial tell you?',
    correct:'The highest power of x with a nonzero coefficient',
    wrong:['The number of terms','The constant term only'],
    prereqs:[]
  },
  'division-concept':{
    id:'division-concept',type:'conceptual',level:2,
    q:'What does a quotient represent in polynomial division?',
    correct:'How many times the divisor fits into the dividend with some remainder left over',
    wrong:['A sum of the divisor and remainder','Always the same as the dividend'],
    prereqs:[]
  },
  'sign-of-c':{
    id:'sign-of-c',type:'conceptual',level:2,
    q:'When dividing by (x + 3), what value of c do you use in synthetic division?',
    correct:'-3 (rewrite as x-(-3))',
    wrong:['3','+3'],
    prereqs:[]
  },
  'zero-placeholder':{
    id:'zero-placeholder',type:'conceptual',level:2,
    q:'If a polynomial is missing the x^2 term, what coefficient must you use for it?',
    correct:'0',
    wrong:['1','Skip it'],
    prereqs:[]
  },
  'degree-reduction':{
    id:'degree-reduction',type:'conceptual',level:2,
    q:'If P(x) has degree 4 and you divide by x-c, what degree is the quotient?',
    correct:'Degree 3 (one less)',
    wrong:['Degree 4','Degree 2'],
    prereqs:['poly-degree']
  },
  'factor-vs-remainder':{
    id:'factor-vs-remainder',type:'conceptual',level:2,
    q:'What distinguishes the Factor Theorem from the Remainder Theorem?',
    correct:'Factor Theorem is the special case where the remainder equals 0',
    wrong:['They are completely unrelated','Factor Theorem works for quadratic divisors'],
    prereqs:[]
  },
  'multiply-add-step':{
    id:'multiply-add-step',type:'computational',level:3,
    q:'In synthetic division, if the current bottom-row value is 3 and c = 2, what goes in the next column above the line?',
    correct:'6 (multiply 3 by 2)',
    wrong:['5 (add 3 and 2)','1 (subtract)'],
    prereqs:['eval-poly']
  },
  'leading-term-division':{
    id:'leading-term-division',type:'computational',level:3,
    q:'What is x^3 divided by x?',
    correct:'x^2',
    wrong:['x^3','x'],
    prereqs:['poly-degree']
  }
};

function wireL1toL2(PREREQ_DAG){
  const rules=[
    [/evaluate|P\(3\)|P\(-2\)|P\(c\)|value|substitut/i,['eval-poly']],
    [/degree/i,['poly-degree']],
    [/divisor|factor|divide|quotient|Q\(x\)|D\(x\)/i,['division-concept']],
    [/sign|x\s*\+|x\s*-|\(x\+|\(x-|rewrite.*c/i,['sign-of-c']],
    [/missing.*term|placeholder|zero.*coefficient|insert.*0/i,['zero-placeholder']],
    [/degree.*quotient|one.*less|degree.*reduction/i,['degree-reduction']],
    [/factor.*theorem.*vs|remainder.*0.*factor|special.*case/i,['factor-vs-remainder']],
    [/multiply.*add|bring.*down|synthetic.*step/i,['multiply-add-step']],
    [/leading.*term|first.*step.*division|divide.*leading/i,['leading-term-division']]
  ];
  for(const node of Object.values(PREREQ_DAG)){
    if(node.level!==1||!node.autoGen||node.prereqs.length>0)continue;
    const matched=new Set();
    for(const[re,ids]of rules){
      if(re.test(node.q)||re.test(node.correct)){
        ids.forEach(id=>{if(PREREQ_DAG[id])matched.add(id);});
      }
    }
    if(matched.size>0)node.prereqs=[...matched];
  }
}

if(typeof expandFormulaBlankCoverage==='function')expandFormulaBlankCoverage(ALG2_POLYNOMIALS_CARTRIDGE);

ALG2_POLYNOMIALS_CARTRIDGE.variableBank=VARIABLE_BANK;
ALG2_POLYNOMIALS_CARTRIDGE.applicationBank=APPLICATION_BANK;
ALG2_POLYNOMIALS_CARTRIDGE.relationshipBank=RELATIONSHIP_BANK;
ALG2_POLYNOMIALS_CARTRIDGE.explanationGlossary=EXPLANATION_GLOSSARY;
ALG2_POLYNOMIALS_CARTRIDGE.autoBlankSpecs=AUTO_BLANK_SPECS;
ALG2_POLYNOMIALS_CARTRIDGE.domLabels=DOM_LABELS;
ALG2_POLYNOMIALS_CARTRIDGE.sharedPrereqNodes=SHARED_PREREQ_NODES;
ALG2_POLYNOMIALS_CARTRIDGE.normalizeExplanationLookup=normalizeExplanationLookup;
ALG2_POLYNOMIALS_CARTRIDGE.buildExplanationBank=buildExplanationBank;
ALG2_POLYNOMIALS_CARTRIDGE.wireL1toL2=wireL1toL2;

window.TD_CARTRIDGES=window.TD_CARTRIDGES||[];
window.TD_CARTRIDGES.push(ALG2_POLYNOMIALS_CARTRIDGE);
window.ALG2_POLYNOMIALS_CARTRIDGE=ALG2_POLYNOMIALS_CARTRIDGE;
})();
