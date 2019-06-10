<template>
    <form @submit.prevent="authenticate">
        <div class="form-group">
            <label class="form-control-desc" for="password">Password to unlock</label>
            <div class="form-control-error" v-if="error">{{ error }}</div>

            <ArrowRightIcon class="form-control-icon" @click="authenticate()"/>
            <input
                id="password"
                class="form-control mod-password"
                :class="{ 'mod-error': error }"
                type="password"
                v-model="password"
                placeholder="Password...">
        </div>
    </form>
</template>

<script>
import { ArrowRightIcon } from 'vue-feather-icons';

export default {
    props: [
        'state',
        'dbStore',
    ],
    data: () => ({
        password: '',
        error: null,
    }),
    methods: {
        authenticate() {
            if (this.password === '') {
                this.error = 'Password required';
                return;
            }

            this.dbStore.auth(this.state.db, this.password)
                .then((db) => {
                    if (!db) {
                        this.error = 'Invalid password';
                        return;
                    }

                    this.$emit('pagePrev');
                });
        },
    },
    components: {
        ArrowRightIcon,
    },
};
</script>

<style>

</style>
