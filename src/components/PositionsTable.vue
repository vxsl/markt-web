<template>
        <div class="table-responsive">
            <table id="positionsData" v-if="Object.keys(positions).length > 0" class="table table-dark">
                <thead>
                    <tr>
                        <th></th>
                        <th>QTY</th>
                        <th>VAL</th>
                        <th >NET</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(position, ticker) in positions" :key="ticker">
                        <td class="ticker">{{ticker}}</td>
                        <td>{{position.quantity}}</td>
                        <td>${{parseFloat(position.quantity * stocks[ticker].price.current).toFixed(2)}}</td>
                        <td style="display:min-width:1000px;">{{position.netString}}</td>
                    </tr>
                    </tbody>
            </table>
            <table id="positionsData" v-else class="table table-dark">
                <tbody>
                <tr>
                    <td>No current positions.</td>
                </tr>
                </tbody>
            </table>
        </div>
</template>

<script>
export default {
    props: {
        positions: {},
        stocks: {}
    }
}
</script>

<style lang="scss">
#positionsData {
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