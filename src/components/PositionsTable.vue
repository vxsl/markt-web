<template>
        <div class="table-responsive">
            <table id="positionsData" v-if="Object.keys(positions).length > 0" class="table table-dark">
                <thead>
                    <tr>
                        <th></th>
                        <th>Qty</th>
                        <th>Value</th>
                        <th>Net</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(position, ticker) in positions" :key="ticker">
                        <td>{{ticker}}</td>
                        <td>{{position.quantity}}</td>
                        <td>${{parseFloat(position.quantity * stocks[ticker].price.current).toFixed(2)}}</td>
                        <td>{{position.netString}}</td>
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
        width:100%;
        font-weight:100;
    }
    td, th {
        border:none !important;
    }
}
</style>