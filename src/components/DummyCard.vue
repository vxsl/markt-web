<template>
    <div ref="test" class="chart-container-container">
        <div class="chart-container">
            <div id="dummy_chart_overlay" @click="initPosition()">
                <p ref="plus" v-show="!selecting">+</p>
                <div class="autocomplete-container">
                    <autocomplete v-show="selecting" class="ticker-input" ref="tickerInput" :search="search"></autocomplete>
                </div>
            </div>
            <div class="chart-extlabel">
                <h2>&nbsp;</h2>
            </div>
            <DummyChart/>
        </div>
    </div>
</template>

<script>
import DummyChart from '@/components/DummyChart.vue'
import Autocomplete from '@trevoreyre/autocomplete-vue'
import knownSymbols from '@/js/data/knownSymbols.json'
console.dir(knownSymbols)

export default {
  data() {
      return {
          selecting: false
      }
  },
  props: {
    ticker: String,    
  },
  components: {
      DummyChart,
      Autocomplete
  },
  mounted() {
  },
  methods: {
      search(input) {
        return knownSymbols.ca.filter(symbol => {
            return symbol.label.startsWith(input.toUpperCase())
        }).map(a => a.label)
      },
      initPosition() {
        this.selecting = true;
        let input = this.$refs.tickerInput.$el.children[0].children[0]
        input.focus()
        input.select()

        /* $( "#symbol" ).autocomplete({    
            minLength: 0,
            source: knownSymbols.ca.concat(knownSymbols.nasdaq),        
            select: async function( event, ui ) {
                $( "#symbol" ).val( ui.item.label );    
                positions.push(await appLink.createPosition(ui.item.label))
                updateTable()        
                return false;
            }
        })
        .autocomplete( "instance" )._renderItem = function( ul, item ) {
            return $( "<li>" )
            .append( "<div class='input-menu-item'>" + item.label + "<br><div class='input-menu-subheading'>" + item.name + "</div></div>" )
            .appendTo( ul );
        }; */

      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '../scss/autocomplete-custom.css';

#dummy_chart_overlay {
    position:absolute;
    z-index:2;
    border-radius: 1.1em;
    width:100%;
    height:100%;   
    display: flex;
    justify-content: center;
    align-items: center;
    cursor:pointer;

    p {
        user-select:none;
        display:block !important;
        color:rgb(61, 61, 61);
        position: absolute;
        font-size:600%;
    }
    .ticker-input {
    }

    .autocomplete-container {
        padding:1em;
    }
}


</style>
