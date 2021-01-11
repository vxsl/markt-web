<template>
        <div class="table-responsive">
            <table id="positionsData" v-if="Object.keys(positions).length > 0" class="table table-dark table-striped table-responsive">
                <thead>
                    <tr>
                        <th></th>
                        <th>Quantity</th>
                        <th>Value</th>
                        <th>Margin</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(position, ticker) in positions" :key="ticker">
                        <td>{{ticker}}</td>
                        <td>{{position.quantity}}</td>
                        <td>{{parseFloat(stocks[ticker].price.current).toFixed(2)}}</td>
                        <td>{{parseFloat(stocks[ticker].price.max).toFixed(2)}}</td>
                    </tr>
                    </tbody>
            </table>
            <table id="positionsData" v-else class="table table-dark">
                <tbody>
                <tr>
                    <td>No positions yet.</td>
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
    td {
        border:none !important;
    }
}
</style>