function tmpl(str, data) {
    var engine = new Function('obj', `
        var p = [];
        with(obj) {
            p.push('${
        str
        // 去除换行制表符\t\n\r
            .replace(/[\t\r\n]/g, " ")
            // 将左分隔符变成 \t
            .split("<%").join("\t")
        // 去掉模板中单引号的干扰
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            // 为 html 中的变量变成 ",xxx," 的形式, 如：\t=users[i].url%> 变成  '，users[i].url,'  
            // 注意这里只有一个单引号，还不配对 
            .replace(/\t=(.*?)%>/g, "',$1,'")
            // 这时候，只有JavaScript 语句前面才有 "\t",  将  \t  变成   '); 
            // 这样就可把 html 标签添加到数组p中，而javascript 语句 不需要 push 到里面。
            .split("\t").join("');")
        // 这时候，只有JavaScript 语句后面才有 "%>", 将 %> 变成  p.push(' 
        // 上一步我们再 html 标签后加了 ');， 所以要把 p.push(' 语句放在 html 标签放在前面，这样就可以变成 JavaScript 语句
            .split("%>").join("p.push('")
        // 将上面可能出现的干扰的单引号进行转义
            .split("\r").join("\\'")}');
        }
        return p.join("");
    `);

    return data ? engine(data) : engine;
}