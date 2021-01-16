<template>
    <div>
        <div class="modal fade show" ref="modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true" style="display:block">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" style="font-weight:500">{{title}}</h5>
                <button v-if="closeable" type="button" class="close" data-dismiss="modal" aria-label="Close" @click="close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body" style="white-space: pre-line" v-html="message">
                <!-- {{message}} -->
            </div>
            <div v-if="closeable" class="modal-footer">
                <button type="button" class="btn btn-primary" @click="close">OK</button>
            </div>
            </div>
        </div>
        </div>
        <div class="modal-backdrop fade show" ref="modalBackdrop" @click="close"></div>
    </div>
</template>

<script>
export default {
    props: {
        title: String,
        message: String,
        closeable: Boolean
    },
    mounted() {
        document.addEventListener("keyup", this.close);
    },
    methods: {
        close() {
            if (this.closeable) {
                this.$refs.modal.classList.remove('show')
                this.$refs.modal.style.display = "none"
                this.$refs.modalBackdrop.classList.remove('show')
                this.$refs.modalBackdrop.style.display = "none"
                this.$emit('done', this.title)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.modal {
    user-select:none;
}
</style>