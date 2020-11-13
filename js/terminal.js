

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

/* $( function() {
    $( "#tags" ).autocomplete({
      source: knownSymbols.ca
    });
  } ); */

$( function() {
 
    $( "#symbol" ).autocomplete({
        minLength: 0,
        source: knownSymbols.ca.concat(knownSymbols.nasdaq),        
        select: function( event, ui ) {
            $( "#symbol" ).val( ui.item.label );    
            return false;
        }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" )
        .append( "<div class='input-menu-item'>" + item.label + "<br><div class='input-menu-subheading'>" + item.name + "</div></div>" )
        .appendTo( ul );
    };
  } );