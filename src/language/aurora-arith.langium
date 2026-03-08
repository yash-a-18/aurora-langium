grammar Arith

entry Arith_Module:
    'arith_module' name=ID
    '{'
    (statements+=Statement)*
    '}';

Statement:
    Definition | Evaluation | IfStatement;

IfStatement:
    'if' '(' condition=Expression ')'
    thenBlock=Block
    (
      'else' (
          elseIf=IfStatement |
          elseBlock=Block
      )
    )?;

Block:
    '{' statements+=Statement* '}';

Definition:
    'def' name=ID ('(' args+=DeclaredParameter (',' args+=DeclaredParameter)* ')')?
    ':' expr=Expression ';';

DeclaredParameter:
    name=ID;

type AbstractDefinition = Definition | DeclaredParameter;

Evaluation:
    expression=Expression ';';


Expression:
    BinaryExpression;


infix BinaryExpression on PrimaryExpression:
    '^'
    > '*' | '/'
    > '+' | '-'
    > '%'
    > '==' | '!=' | '<' | '>' | '<=' | '>=';


PrimaryExpression infers Expression:
    '(' Expression ')' |
    {infer BooleanLiteral} value=('true' | 'false') |
    {infer NumberLiteral} value=NUMBER |
    {infer FunctionCall} func=[AbstractDefinition] ('(' args+=Expression (',' args+=Expression)* ')')?;

// --- Terminals ---
hidden terminal ARITH_WS: /\s+/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;
terminal ID: /[a-zA-Z0-9_]+/;
terminal INT: /[0-9]+/;
hidden terminal ARITH_ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT returns string:'//'  !('\n' | '\r' )('\r'? '\n' )?  ;
