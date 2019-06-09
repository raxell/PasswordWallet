<template>
    <form @submit.prevent="authenticate">
        <div class="form-group">
            <label class="form-control-desc" for="password">Password to unlock</label>
            <div class="form-control-error" v-if="error">{{ error }}</div>
            <input
                id="password"
                class="form-control"
                :class="{ 'mod-error': error }"
                type="password"
                v-model="password"
                placeholder="Password...">
            <ArrowRightIcon class="form-control-icon" @click="authenticate()"/>
        </div>
    </form>
</template>

<script>
import { ArrowRightIcon } from 'vue-feather-icons';

export default {
    props: [
        'db',
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

            this.$parent.dbStore.auth(this.db, this.password)
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
