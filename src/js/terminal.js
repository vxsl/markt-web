

$('#terminal').terminal({
    hello: function(what) {
        this.echo('Hello, ' + what +
                  '. Welcome to this terminal.');
    },
    add: function(symbol) {
        this.echo("adding " + symbol)
    }
}, {
    checkArity:true,
    greetings: 'Welcome.\n\nUsage:\n- add [symbol]\n- remove [symbol]\n'
});
