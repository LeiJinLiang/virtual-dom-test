function compile(template){

    var evalExpr = /\<\%\=(.+?)\%\>/g;

    // regex for expressions
    var expr = /\<\%([\s\S]+?)\%\>/g;

    // regex for empty echos
    var empty = /echo\(\"\"\);/g;

    template = template
    // replace all evaluations with echos or their contents
        .replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`')

        // replace <% in expressions with `");`
        // and %> in expressions with `echo("`
        .replace(expr, '`); \n $1 \n  echo(`');

    // wrap the whole thing in an echo
    template = 'echo(`' + template + '`);';

    // remove empty echos
    template = template
        .replace(empty, "");

    // stores the JavaScript text to be written to be returned
    var script =
        `(function parse(data){
  
    // stores the parsed template
    var output = "";
  
    // appends HTML to the parsed template
    function echo(html){
      output += html;
    }
  
    // contains echos, etc
    ${ template }
  
    return output;
  })`;

    return script;
}


function tmpl(template,data) {
    var parse = eval(compile(template));
    return parse(items)
}