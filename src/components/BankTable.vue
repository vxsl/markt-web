<template>
    <div id="banktable-container">
        <span :class="balanceStyle" class="main-balance">${{parseFloat(stats.balance).toFixed(2)}}</span>
        <br>
        <span :class="balanceStyle" class="balance-sub">${{parseFloat(bank.cash).toFixed(2)}} cash</span>
        <br>
        <span :class="balanceStyle" class="balance-sub">${{parseFloat(bank.positions).toFixed(2)}} tied up</span>
        
        <div class="table-responsive">
            <table class="table table-dark">
                <tbody>
                    <tr>
                        <th>Return</th>
                        <td>{{'$' + parseFloat(stats.return.dollar).toFixed(2) + ' (' + parseFloat(stats.return.percent).toFixed(2) + '%)'}}</td>
                    </tr>
                    <tr>
                        <th>Trades</th>
                        <td>{{bank.trades}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        positions: {},
        stocks: {},
        bank: {},
        stats: {}
    },
    computed: {
        balanceStyle() {
            if (this.bank.balance > this.bank.totalDeposited) {
                return 'gain'
            }
            else if (this.bank.balance < this.bank.totalDeposited) {
                return 'loss'
            }
            return ''
        }
    }
}
</script>

<style lang="scss">
@import '@/scss/custom.scss';

#banktable-container {
    text-align:right;
    .main-balance {
        font-weight:100;
        font-size:2.5em;
    }
    .balance-sub {
        font-weight:100;
        font-style:italic
    }
    .gain {
        color:$positive-color;
    }
    .loss {
        color:$danger-color;
    }
    table {
        margin-top:1em;
        border-radius:1em;
        td, th {
            border:none;
        }
        td {
            float:right;
        }
        th {
            font-weight:100;
        }
    }
}

</style>