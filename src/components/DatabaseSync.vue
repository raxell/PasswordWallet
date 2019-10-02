<template>
    <form class="main" @submit.prevent="executeAction">
        <div class="form-group" v-if="state.action === 'export'">
            <a class="form-action mod-confirm" @click="downloadToDisk">Export to disk</a>
        </div>

        <template v-if="state.action === 'import'">
            <div class="form-group" >
                <label class="form-control-desc" for="file">Database File</label>
                <input
                    id="file"
                    class="form-control"
                    type="file"
                    placeholder="File..."
                    @change="loadFile">
            </div>
            <div class="alternative-import">Or import from server</div>
        </template>


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
            <label class="form-control-desc" for="code">
                Temp code {{ state.action === 'export' ? '(remember it for subsequent import)' : ''}}
            </label>
            <div class="form-control-error" v-if="code.error">{{ code.error }}</div>
            <input
                id="code"
                class="form-control mod-password"
                :class="{ 'mod-error': code.error }"
                :type="state.action === 'export' ? 'text' : 'password'"
                placeholder="Temp code..."
                v-model="code.value"
                :readonly="state.action === 'export'">
        </div>
        <div class="form-group mod-action">
            <button class="form-action" type="submit">
                {{ state.action === 'export' ? 'Upload': 'Import' }}
            </button>
        </div>
    </form>
</template>

<script>
import * as Db from '../db.js';
import * as Crypto from '../crypto-utils.js';

export default {
    created() {
        if (this.state.action === 'export') {
            this.code.value = Crypto.bufferToBase64(Crypto.randomBytes(6));
        }
    },
    props: [
        'state',
        'dbStore',
    ],
    data: () => ({
        file: {
            name: '',
            data: null,
        },
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
        loadFile(event) {
            const reader = new FileReader();
            reader.addEventListener('load', (e) => {
                try {
                    this.file = JSON.parse(e.target.result);
                } catch (err) {
                    this.$emit('notice', 'error', 'Cannot read the file, invalid format.');
                }

            });
            reader.readAsText(event.target.files[0]);
        },
        serializedDb() {
            return JSON.stringify({
                name: this.state.db,
                data: Db.exportDb(this.state.db),
            });
        },
        downloadToDisk(event) {
            if (!this.dbStore.get(this.state.db)) {
                this.$emit('sessionExpired');
                return;
            }

            event.target.href = URL.createObjectURL(new Blob([this.serializedDb()], { type: 'text/plain' }));
            event.target.download = `${this.state.db}.txt`;
        },
        upload() {
            if (!this.dbStore.get(this.state.db)) {
                this.$emit('sessionExpired');
                return;
            }

            this.id.error = this.id.value === '' ? 'Id required' : null;

            if (!this.id.error) {
                const body = JSON.stringify({
                    id: this.id.value,
                    db: this.serializedDb(),
                    code: this.code.value,
                });

                fetch(`${location.origin}/db`, {
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
                            this.$emit('notice', 'success', 'Database uploaded successfully, you can now import it from another device.');
                        }
                    })
                    .catch(() => {
                        this.$emit('notice', 'error', 'Network Error, you have to be online to use server syncronization.');
                    });
            }
        },
        importDb() {
            if (this.file.data) {
                if (Db.exists(this.file.name)) {
                    this.$emit('notice', 'error', `Database "${this.file.name}" already exists.`);
                    return;
                }

                Db.importDb(this.file.name, this.file.data);
                this.$emit('notice', 'success', 'Database imported successfully');
                this.$emit('pageChange', 'Index');

                return;
            }

            this.id.error = this.id.value === '' ? 'Id required' : null;
            this.code.error = this.code.value === '' ? 'Code required': null;

            if (!this.id.error && !this.code.error) {
                const id = encodeURIComponent(this.id.value);
                const code = encodeURIComponent(this.code.value);

                fetch(`${location.origin}/db?id=${id}&code=${code}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (!res.success) {
                            this[res.field].error = res.error;
                            return;
                        }

                        const { name, data } = JSON.parse(res.data);
                        if (Db.exists(name)) {
                            this.$emit('notice', 'error', `Database "${name}" already exists.`);
                            return;
                        }

                        Db.importDb(name, data);
                        this.$emit('notice', 'success', 'Database imported successfully');
                        this.$emit('pageChange', 'Index');
                    })
                    .catch(() => {
                        this.$emit('notice', 'error', 'Network Error, you have to be online to use server syncronization.');
                    });
            }
        },
        executeAction() {
            switch (this.state.action) {
                case 'export':
                    this.upload();
                    break;
                case 'import':
                    this.importDb();
                    break;
            }
        }
    }
}
</script>

<style>
.alternative-import {
    text-align: center;
    margin: 2rem 0;
}
</style>
