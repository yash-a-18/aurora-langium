grammar Aurora

import './aurora-arith';

entry PCM:
    package=PACKAGE ?
    imports+=Import *
    module=MODULE ?
    template=TEMPLATE ?
    elements+=(Issues |  Orders | Clinical | Arith_Module | Evaluation)*
;

/* Package and Import */
PACKAGE:'package' name=QualifiedName  ';';
Import: 'import' importedNamespace=QualifiedNameWithWildcard  ';';
QualifiedNameWithWildcard returns string: QualifiedName '.*'?;
QualifiedName returns string: ID ('.' ID )*;
NL_STATEMENT:
    name=( NL_STATEMENTMULTI | SINGLENL  );
Clinical:
'Clinical:'
narrative+=NL_STATEMENT*
namedGroups+=NamedGroupClinical*;

NamedGroupClinical:
    name=ID_WITH_COLON
    timestamp=TimeStamp ?
    qurc = QuReferences?
    narrative+=NL_STATEMENT *
    coord+=(ClinicalCoordinate | ClinicalValue  )*
;

ClinicalCoordinate:
    qu+=QU *
    timestamp=TimeStamp ?
    name=ID
    qurc = QuReferences?
    narrative+=NL_STATEMENT *
;

ClinicalValue:
    qu+=QU *
    timestamp=TimeStamp ?
    name=ID
    '['
    values+=SingleValueUnit
    (',' values+=SingleValueUnit  )*
    ']'
    qurc = QuReferences?
    narrative+=NL_STATEMENT *
;

/* Value Unit */
SingleValueUnit :
    negative='(-)' ?
    value=(ID | NUMBER | Float | Fraction | Boolean  )
    unit=(ID | NUMBER | Float | Fraction | Boolean | '_'  )
;

Fraction returns string: NUMBER '/' NUMBER;
Boolean returns string: 'TRUE' | 'FALSE' ;
Float returns string: NUMBER '.' NUMBER ;

TimeStamp:
    '@' ((empty="time" ) | (date=AuroraDate  | time=Time  )| (date=AuroraDate  time=Time  ) )
;

Issues:
'Issues:'
narrative+=NL_STATEMENT*
coord+=IssueCoordinate*;

IssueCoordinate:
    comment+= ML_COMMENT*
    qu += QU*
    name=ID
    qurc = QuReferences?
    (':' snomed=Snomed)?
    ('from' mods+=[MODULE:ID] (',' mods+=[MODULE:ID])*
            ('with' temps+=[TEMPLATE: ID] (',' temps+=[TEMPLATE:ID])*)? )?
    narrative+=NL_STATEMENT*
;

ReferenceCoordinate: (IssueCoordinate | OrderCoordinate | ClinicalCoordinate);

QuReference:
    qu += QU*
    ref = [ReferenceCoordinate:ID];

QuReferences:
    '('quRefs += QuReference  (',' quRefs += QuReference)* ')';

Orders:
'Orders:'
narrative+=NL_STATEMENT*
(namedGroups+=NamedGroupOrder)*;

NamedGroupOrder:
    comment+= ML_COMMENT*
    qu += QU*
    name=ID_WITH_COLON
    qurc = QuReferences?
    narrative+=NL_STATEMENT *
    (orders+=(OrderCoordinate | MutuallyExclusive))*;

OrderCoordinate:
    comment+= ML_COMMENT*
    qu += QU*
    name=ID
    qurc = QuReferences?
    narrative+= NL_STATEMENT* ;

MutuallyExclusive:
    comment+= ML_COMMENT*
    order1=OrderCoordinate 'or' order2=OrderCoordinate;

/* Template and Module */
TEMPLATE: "template" name=ID  elements+=(Clinical |  Orders)*;
MODULE:   "module:"  name=ID  elements+=(Issues |  Orders)*;

AuroraDate returns string:NUMBER '/' NUMBER '/' NUMBER  | NUMBER | NUMBER '/' NUMBER;
Time returns string: NUMBER ':' NUMBER ;
QU: query=QUTERMINAL;

Snomed:name=ID;

//For all PREFIX SINGLE the single quotes are mandatory
terminal PREFIXSINGLE : ('-') ('?' | '!' | '.' | 'x' )? ;
// For all PREFIX MULTI the single quotes are optional but semi-colon at the end is mandatory
terminal PREFIXMULTI :('--' | '??' | '!!' | '..' | 'xx' );


terminal NL_STATEMENTMULTI returns string: PREFIXMULTI -> /[^\n]*;/;
terminal ID_WITH_COLON: /[a-zA-Z_][a-zA-Z0-9_]*:/;
// terminal ID: /[a-zA-Z0-9_]+/;
terminal SINGLENL returns string: PREFIXSINGLE -> /'[^\n]*'/;
terminal ML_COMMENT returns string:'/*'  -> '*/'  ;
// hidden terminal WS: /\s+/;
terminal QUTERMINAL returns string:('?' | '!' | '~');