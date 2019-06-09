<template>
    <form id="create-db" @submit.prevent="persistDb()">
        <div class="form-group">
            <label class="form-control-desc" for="name">Database name</label>
            <div class="form-error" v-if="name.error">{{ name.error }}</div>
            <input
                id="name"
                class="form-control"
                :class="{ 'mod-error': name.error }"
                type="text"
                placeholder="Name..."
                v-model="name.value">
        </div>
        <div class="form-group">
            <label class="form-control-desc" for="password">Database password</label>
            <div class="form-error" v-if="password.error">{{ password.error }}</div>
            <input
                id="password"
                class="form-control"
                :class="{ 'mod-error': password.error }"
                type="password"
                placeholder="Password..."
                v-model="password.value">
        </div>
        <div class="form-group mod-action">
            <button class="form-action" type="submit">Save changes</button>
        </div>
    </form>
</template>

<script>
import { Database } from '../db.js';

export default {
    data: () => ({
        name: {
            value: '',
            error: null,
        },
        password: {
            value: '',
            error: null,
        },
    }),
    methods: {
        validateName() {
            if (this.name.value === '') {
                this.name.error = 'Name required';
            } else {
                this.name.error = null;
            }
        },
        validatePassword() {
            if (this.password.value.length < 8) {
                this.password.error = '8 characters min';
            } else {
                this.password.error = null;
            }
        },
        persistDb() {
            this.validateName();
            this.validatePassword();

            if (!this.name.error && !this.password.error) {
                Database(this.name.value, this.password.value)
                    .then((db) => {
                        return db.save();
                    })
                    .then(() => {
                        this.$emit('notice', 'success', 'Database created successfully');
                        this.$emit('pageChange', 'Index');
                    })
                    .catch(() => {

                    });
            }
        }
    }
}
</script>

<style>
</style>
