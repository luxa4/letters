module.exports = {
  root: true,
  env: {
    "node": true
  },
  parserOptions: {
    "parser": "babel-eslint"
  },
  extends: [
    "plugin:vue/essential",
  ],
  // add your custom rules here
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'require-atomic-updates': 'off',
    indent: ['error', 2],
    'vue/no-side-effects-in-computed-properties': 'off',
    'vue/no-v-html': 'off',
    'vue/attribute-hyphenation': [2, 'never'],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'never'
      }
    ],
    'vue/html-indent': [
      'error',
      2,
      {
        attribute: 1,
        baseIndent: 0,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: []
      }
    ],
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        normal: 'always',
        component: 'always'
      },
      svg: 'always',
      math: 'always'
    }],
    'vue/singleline-html-element-content-newline': ['error', {
      ignoreWhenNoAttributes: true,
      ignoreWhenEmpty: true,
      ignores: ['h1', 'h2', 'h3', 'p', 'span', 'li', 'textarea', 'a']
    }],
    'no-console': 'off',
    'no-debugger': 'off',
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: true
      }
    ],
    semi: ['error', 'always'],
    camelcase: 0,
    'object-curly-spacing': ['error', 'always'],
    'linebreak-style': 0,
    'operator-linebreak': [
      2,
      'after',
      {
        overrides: {
          '?': 'before',
          ':': 'before'
        }
      }
    ],
    'no-case-declarations': 'off',
    // 'no-unused-vars': [
    //   'error',
    //   {
    //     vars: 'all',
    //     args: 'none',
    //     ignoreRestSiblings: false
    //   }
    // ]
  },
  overrides: [
    {
      "files": ["*.vue"],
      "rules": {
        "indent": "off"
      }
    }
  ]
};
