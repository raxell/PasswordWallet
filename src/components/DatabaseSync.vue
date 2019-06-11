<template>
    <form class="main" @submit.prevent="upload">
        <div class="form-group" v-if="state.action === 'export'">
            <a class="form-action mod-confirm" @click="downloadToDisk">Export to disk</a>
        </div>

        <div class="form-group">
            <label class="form-control-desc" for="id">Database Id</label>
            <div class="form-control-error" v-if="id.error">{{ id.error }}</div>
            <input
                id="id"
                class="form-control"
                :class="{ 'mod-error': id.error }"
                type="text"
                placeholder="Id..."
                v-model="id.value">
        </div>
        <div class="form-group">
            <label class="form-control-desc" for="code">Temp code (remember it for subsequent import)</label>
            <input
                id="code"
                class="form-control mod-password"
                type="text"
                placeholder="Temp code..."
                v-model="code.value"
                readonly>
        </div>
        <div class="form-group mod-action">
            <button class="form-action" type="submit">Upload</button>
        </div>
    </form>
</template>

<script>
import * as Db from '../db.js';
import * as Crypto from '../crypto-utils.js';

export default {
    created() {
        if (this.state.action === 'export') {
            this.code.value = Crypto.randomBytes(6);
        }
    },
    props: [
        'state',
        'dbStore',
    ],
    data: () => ({
        id: {
            value: '',
            error: null,
        },
        code: {
            value: '',
            error: null,
        },
    }),
    methods: {
        serializedDb() {
            return JSON.stringify({
                name: this.state.db,
                data: Db.exportDb(this.state.db),
            });
        },
        downloadToDisk(event) {
            event.target.href = URL.createObjectURL(new Blob([this.serializedDb()], { type: 'text/plain' }));
            event.target.download = `${this.state.db}.txt`;
        },
        upload() {
            this.id.error = this.id.value === '' ? 'Id required' : null;

            if (!this.id.error) {
                const body = JSON.stringify({
                    id: this.id.value,
                    db: this.serializedDb(),
                    code: this.code.value,
                });

                fetch('http://localhost:3000/db', {
                    body,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (!res.success) {
                            this.id.error = `Id "${this.id.value}" already exists, choose another one.`;
                        } else {
                            this.$emit('notice', 'success', 'Database uploaded successfully, you can now import it on another device.');
                        }
                    })
                    .catch(() => {
                        this.$emit('notice', 'error', 'Network Error, you have to be online to use server syncronization.');
                    });
            }
        }
    }
}
</script>

<style>
</style>
