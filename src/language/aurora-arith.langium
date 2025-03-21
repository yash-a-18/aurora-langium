grammar Arith

entry Arith_Module:
    'arith_module' name=ID
    (statements+=Statement)*;

Statement:
    Definition | Evaluation;

Definition:
    'def' name=ID ('(' args+=DeclaredParameter (',' args+=DeclaredParameter)* ')')?
    ':' expr=Expression ';';

DeclaredParameter:
    name=ID;

type AbstractDefinition = Definition | DeclaredParameter;

Evaluation:
    expression=Expression ';';

Expression:
    Addition;

Addition infers Expression:
    Multiplication ({infer BinaryExpression.left=current} operator=('+' | '-') right=Multiplication)*;

Multiplication infers Expression:
    Exponentiation ({infer BinaryExpression.left=current} operator=('*' | '/') right=Exponentiation)*;

Exponentiation infers Expression:
    Modulo ({infer BinaryExpression.left=current} operator='^' right=Modulo)*;

Modulo infers Expression:
    PrimaryExpression ({infer BinaryExpression.left=current} operator='%' right=PrimaryExpression)*;

PrimaryExpression infers Expression:
    '(' Expression ')' |
    {infer NumberLiteral} value=NUMBER |
    {infer FunctionCall} func=[AbstractDefinition] ('(' args+=Expression (',' args+=Expression)* ')')?;

hidden terminal ARITH_WS: /\s+/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]*)?/;
// terminal ARITH_ID: /[_a-zA-Z][\w_]*/;
terminal ID: /[a-zA-Z0-9_]+/;
terminal INT: /[0-9]+/;
hidden terminal ARITH_ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal ARITH_SL_COMMENT: /\/\/[^\n\r]*/;