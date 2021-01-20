<template>
        <div class="table-responsive">
            <table id="positionsData" v-if="!past && Object.keys(positions).length > 0" class="table table-dark">
                <thead>
                    <tr>
                        <th></th>
                        <th>QTY</th>
                        <th>VAL</th>
                        <th>NET</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(position, ticker) in positions" :key="ticker">
                        <td class="ticker">{{ticker}}</td>
                        <td>{{position.quantity}}</td>
                        <td>${{parseFloat(position.quantity * stocks[ticker].price.current).toFixed(2)}}</td>
                        <td>{{position.netString}}</td>
                    </tr>
                    </tbody>
            </table>
            <table id="positionsData" v-else-if="!past" class="table table-dark">
                <tbody>
                <tr>
                    <td>No current positions.</td>
                </tr>
                </tbody>
            </table>
            <table id="past-positions" v-else class="table table-dark">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th>QTY</th>
                        <th>RETURN</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in pastPositions" :key="p.timestamp">
                        <td>{{(new Date(parseFloat(p.timestamp))).toLocaleString()}}</td>
                        <td class="ticker">{{p.ticker}}</td>
                        <td>{{p.quantity}}</td>
                        <td>{{p.netString}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
</template>

<script>
export default {
    props: {
        past: {
            type: Boolean,
            default() {
                return false
            }
        },
        pastPositions: {
            type: Array,
            default() {
                return []
            }
        },
        positions: {
            type: Object,
            default() {
                return {}
            }
        },
        stocks: {
            type: Object,
            default() {
                return {}
            }
        }
    }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';

#past-positions {
    background:$dark-grey-color;
    color:$light-grey-color;
}

#positionsData, #past-positions {
    border-radius:1em;
    th {
        font-weight:100;
    }
    td {
        &.ticker {
            font-weight:700
        }
    }
    td, th {
        border:none !important;
    }
}
</style>