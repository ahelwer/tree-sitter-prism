module.exports = grammar({
  name: 'PRISM',

  /*extras: $ => [],*/

  rules: {
    source_file: $ => repeat(
      choice(
        $.model_type,
        $.constant,
        $.legacy_constant,
        $.module,
        $.renamed_module,
        $.multiple_initial_states,
        $.global_variable,
        $.formula,
        $.label,
        $.rewards,
      ),
    ),

    model_type: $ => choice(
      $.dtmc_model_type,
      $.ctmc_model_type,
      $.mdp_model_type,
      $.pta_model_type,
    ),

    dtmc_model_type: $ => choice(
      'dtmc',
      'probabilistic',
    ),

    ctmc_model_type: $ => choice(
      'ctmc',
      'stochastic',
    ),

    mdp_model_type: $ => choice(
      'mdp',
      'nondeterministic',
    ),

    pta_model_type: $ => 'pta',

    constant: $ => seq(
      'const',
      field('type', $.type),
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';',
    ),

    legacy_constant: $ => seq(
      field('type', choice('const', 'rate', 'prob')),
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';',
    ),

    module: $ => seq(
      'module',
      field('name', $.identifier),
      repeat($.variable),
      repeat($.command),
      'endmodule',
    ),

    renamed_module: $ => seq(
      'module',
      field('name', $.identifier),
      '=',
      field('source_module', $.identifier),
      '[',
      repeat(seq($.rename, ',')),
      $.rename,
      ']',
      'endmodule',
    ),

    rename: $ => seq(
      field('old_name', $.identifier),
      '=',
      field('new_name', $.identifier),
    ),

    variable: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', choice($.range, $.type)),
      field('init', optional(seq('init', $.expression))),
      ';'
    ),

    command: $ => seq(
      '[',
      field('action', optional($.identifier)),
      ']',
      $.guard,
      '->',
      choice(
        $.probabilistic_updates,
        $.updates,
      ),
      ';',
    ),

    guard: $ => $.expression,

    probabilistic_updates: $ => seq(
      repeat(seq($.probabilistic_update, '+')),
      $.probabilistic_update,
    ),

    probabilistic_update: $ => seq(
      $.expression,
      ':',
      $.updates
    ),

    updates: $ => seq(
      repeat(seq($.update, '&')),
      $.update
    ),

    update: $ => seq(
      '(',
      field('variable', $.identifier),
      '\'',
      '=',
      field('value', $.expression),
      ')'
    ),

    multiple_initial_states: $ => seq(
      'init',
      field('predicate', $.expression),
      'endinit',
    ),

    global_variable: $ => seq(
      'global',
      field('name', $.identifier),
      ':',
      field('type', choice($.range, $.int_type, $.bool_type)),
      field('init', optional(seq('init', $.expression))),
      ';'
    ),

    formula: $ => seq(
      'formula',
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';',
    ),

    label: $ => seq(
      'label',
      field('name', $.label_identifier),
      '=',
      field('predicate', $.expression),
      ';',
    ),

    rewards: $ => seq(
      'rewards',
      optional($.label_identifier),
      repeat(choice($.state_reward, $.transition_reward)),
      'endrewards'
    ),

    state_reward: $ => seq(
      field('predicate', $.expression),
      ':',
      field('reward', $.expression),
      ';',
    ),

    transition_reward: $ => seq(
      '[',
      field('action', optional($.identifier)),
      ']',
      field('predicate', $.expression),
      ':',
      field('reward', $.expression),
      ';',
    ),

    expression: $ => choice(
      $.value,
      $.identifier,
      $.ternary,
      $.implication,
      $.iff,
      $.logical_or,
      $.logical_and,
      $.logical_neg,
      $.equality,
      $.inequality,
      $.lt,
      $.lte,
      $.gt,
      $.gte,
      $.addition,
      $.subtraction,
      $.multiplication,
      $.division,
      $.unary_minus,
      $.parentheses,
      /*
      $.min,
      $.max,
      $.floor,
      $.ceil,
      $.round,
      $.pow,
      $.mod,
      $.log,
      */
      $.function,
    ),

    parentheses:    $ => prec.left(12, seq('(', $.expression, ')')),

    // Infix functions
    ternary:        $ => prec.left(1, seq($.expression, '?', $.expression, ':', $.expression)),
    implication:    $ => prec.left(2, seq($.expression, '=>', $.expression)),
    iff:            $ => prec.left(3, seq($.expression, '<=>', $.expression)),
    logical_or:     $ => prec.left(4, seq($.expression, '|', $.expression)),
    logical_and:    $ => prec.left(5, seq($.expression, '&', $.expression)),
    logical_neg:    $ => prec.left(6, seq('!', $.expression)),
    equality:       $ => prec.left(7, seq($.expression, '=', $.expression)),
    inequality:     $ => prec.left(7, seq($.expression, '!=', $.expression)),
    lt:             $ => prec.left(8, seq($.expression, '<', $.expression)),
    lte:            $ => prec.left(8, seq($.expression, '<=', $.expression)),
    gt:             $ => prec.left(8, seq($.expression, '>', $.expression)),
    gte:            $ => prec.left(8, seq($.expression, '>=', $.expression)),
    addition:       $ => prec.left(9, seq($.expression, '+', $.expression)),
    subtraction:    $ => prec.left(9, seq($.expression, '-', $.expression)),
    multiplication: $ => prec.left(10, seq($.expression, '*', $.expression)),
    division:       $ => prec.left(10, seq($.expression, '/', $.expression)),
    unary_minus:    $ => prec.left(11, seq('-', $.expression)),

    // Built-in functions
    /*
    min:    $ => seq('min(', repeat1(seq($.expression, ',')), $.expression, ')'),
    max:    $ => seq('max(', repeat1(seq($.expression, ',')), $.expression, ')'),
    floor:  $ => seq('floor(', $.expression, ')'),
    ceil:   $ => seq('ceil(', $.expression, ')'),
    round:  $ => seq('round(', $.expression, ')'),
    pow:    $ => seq('pow(', $.expression, ',', $.expression, ')'),
    mod:    $ => seq('mod(', $.expression, ',', $.expression, ')'),
    log:    $ => seq('log(', $.expression, ',', $.expression, ')'),
    */

    function:  $ => seq(
      field('name', $.function_identifier),
      field('parameter', optional(seq(repeat(seq($.expression, ',')), $.expression))),
      ')'
    ),

    range: $ => seq(
      '[',
      field('low', $.expression),
      '..',
      field('high', $.expression),
      ']',
    ),

    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*/,

    function_identifier: $ => /[A-Za-z_][A-Za-z0-9_]*\(/,

    label_identifier: $ => /\"[A-Za-z_][A-Za-z0-9_]*\"/,

    type: $ => choice(
      $.bool_type,
      $.int_type,
      $.double_type,
    ),

    bool_type: $ => 'bool',

    int_type: $ => 'int',

    double_type: $ => 'double',

    value: $ => choice($.int_value, $.double_value, $.bool_value),

    int_value: $ => /\d+/,

    double_value: $ => /\d+(\/\d+|\.\d+)?/,

    bool_value: $ => choice('true', 'false'),
  }
});