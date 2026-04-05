(function(){
const DUMMY = {
  id: 'test-basics',
  name: 'Test Basics',
  description: 'Minimal cartridge for testing multi-cartridge support',
  icon: '🧪',
  inputMode: 'quiz',
  prefixLabel: null,
  title: 'TEST',
  subtitle: 'BASICS',
  startButton: 'GO',
  instructions: 'Test deck with 2 commands.',
  instructionsSub: '',
  commands: [
    {id:'add',action:'Addition',tier:'core',dom:'arithmetic',hint:'a+b',explain:'Combine two numbers',
      latex:'a + b = c',
      blanks:[{latex:'a + \\boxed{\\,?\\,} = c',answer:'b',choices:['b','a','c']}],
      subconcepts:[
        {q:'What does + mean?',correct:'Combine quantities',wrong:['Subtract','Multiply']},
        {q:'Is addition commutative?',correct:'Yes, a+b = b+a',wrong:['No','Only for negatives']},
        {q:'What is the identity element?',correct:'Zero (a+0=a)',wrong:['One','Negative a']}
      ]},
    {id:'sub',action:'Subtraction',tier:'core',dom:'arithmetic',hint:'a-b',explain:'Find the difference',
      latex:'a - b = c',
      blanks:[{latex:'a - \\boxed{\\,?\\,} = c',answer:'b',choices:['b','a','c']}],
      subconcepts:[
        {q:'What does - mean?',correct:'Remove a quantity',wrong:['Add','Multiply']},
        {q:'Is subtraction commutative?',correct:'No, a-b ≠ b-a usually',wrong:['Yes','Only for zero']},
        {q:'What is a-a?',correct:'Zero',wrong:['One','Undefined']}
      ]}
  ],
  generateQuestion(cmd, allCommands){
    const options = allCommands.map(c=>c.action);
    while(options.length<4)options.push('Unknown');
    const ci = options.indexOf(cmd.action);
    return{type:'identify',latex:cmd.latex,options,correctIdx:ci,correctKey:['a','b','c','d'][ci]};
  },
  formatPrompt(cmd){return cmd.action},
  formatAnswer(cmd){return cmd.latex?'(formula)':cmd.action},
  validateBlank(input,answer){return input.trim().toLowerCase()===answer.trim().toLowerCase()},
};

// Banks (minimal)
const VARIABLE_BANK = {
  'add':[{s:'a',d:'first number'},{s:'b',d:'second number'}],
  'sub':[{s:'a',d:'starting value'},{s:'b',d:'amount subtracted'}]
};
const APPLICATION_BANK = {
  'add':[{scenario:'Combining the count of two groups.',confusionSet:['sub']}],
  'sub':[{scenario:'Finding how many more in one group than another.',confusionSet:['add']}]
};
const RELATIONSHIP_BANK = {};
const EXPLANATION_GLOSSARY = [];
const AUTO_BLANK_SPECS = [];
const DOM_LABELS = {'arithmetic':['Arithmetic Basics']};
const SHARED_PREREQ_NODES = {};
function wireL1toL2(){}

DUMMY.variableBank=VARIABLE_BANK;
DUMMY.applicationBank=APPLICATION_BANK;
DUMMY.relationshipBank=RELATIONSHIP_BANK;
DUMMY.explanationGlossary=EXPLANATION_GLOSSARY;
DUMMY.autoBlankSpecs=AUTO_BLANK_SPECS;
DUMMY.domLabels=DOM_LABELS;
DUMMY.sharedPrereqNodes=SHARED_PREREQ_NODES;
DUMMY.normalizeExplanationLookup=function(s){return s.toLowerCase().trim()};
DUMMY.buildExplanationBank=function(){return{byId:{},byLabel:{}}};
DUMMY.wireL1toL2=wireL1toL2;

// Register
window.TD_CARTRIDGES=window.TD_CARTRIDGES||[];
window.TD_CARTRIDGES.push(DUMMY);
window.DUMMY_CARTRIDGE=DUMMY;
})();
