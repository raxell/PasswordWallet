<template>
    <form @submit.prevent="executeAction()">
        <template v-if="state.action === 'create' || state.action === 'edit'">
            <div class="form-group">
                <label class="form-control-desc" for="name">Entry name</label>
                <div class="form-control-error" v-if="name.error">{{ name.error }}</div>
                <input
                    id="name"
                    class="form-control"
                    :class="{ 'mod-error': name.error }"
                    type="text"
                    placeholder="Name..."
                    v-model="name.value">
            </div>
            <div class="form-group">
                <label class="form-control-desc" for="user">Email/Username</label>
                <div class="form-control-error" v-if="user.error">{{ user.error }}</div>
                <input
                    id="user"
                    class="form-control"
                    :class="{ 'mod-error': user.error }"
                    type="text"
                    placeholder="Email/Username..."
                    v-model="user.value">
            </div>
            <div class="form-group">
                <label class="form-control-desc" for="password">{{ state.entry ? 'New' : '' }} Password</label>
                <div class="form-control-error" v-if="password.error">{{ password.error }}</div>

                <EyeIcon v-if="password.hidden" class="form-control-icon" @click="password.hidden = !password.hidden"/>
                <EyeOffIcon v-else class="form-control-icon" @click="password.hidden = !password.hidden"/>
                <RefreshCwIcon class="form-control-icon" @click="generatePassword()"/>
                <input
                    id="password"
                    class="form-control mod-password"
                    :class="{ 'mod-error': password.error }"
                    :type="password.hidden ? 'password' : 'text'"
                    placeholder="Password..."
                    v-model="password.value">
            </div>
            <div class="form-group mod-action">
                <button class="form-action" type="submit">Save changes</button>
            </div>
        </template>

        <div class="form-group" v-else-if="state.action === 'delete'">
            <button class="form-action mod-confirm" type="submit">Confirm deletion</button>
        </div>
    </form>
</template>

<script>
import { bufferToBase64, randomBytes } from '../crypto-utils.js';
import { RefreshCwIcon, EyeIcon, EyeOffIcon } from 'vue-feather-icons';

export default {
    created() {
        const entry = this.db.get(this.state.entry);
        this.user.value = entry ? entry.user : '';
        this.name.value = this.state.entry || '';
    },
    components: {
        RefreshCwIcon,
        EyeIcon,
        EyeOffIcon,
    },
    props: [
        'state',
        'dbStore',
    ],
    data: () => ({
        name: {
            value: '',
            error: null,
        },
        user: {
            value: '',
            error: null,
        },
        password: {
            value: '',
            error: null,
            hidden: true,
        },
    }),
    computed: {
        db() {
            return this.dbStore.get(this.state.db);
        },
    },
    methods: {
        generatePassword() {
            this.password.value = bufferToBase64(randomBytes(24));
        },
        validateName() {
            if (this.name.value === '') {
                this.name.error = 'Name required';
            } else if (this.db.get(this.name.value) && this.name.value !== this.state.entry) {
                this.name.error = `Entry "${this.name.value}" already exists`;
            } else {
                this.name.error = null;
            }
        },
        validateUser() {
            if (this.user.value === '') {
                this.user.error = 'Email/Username required';
            } else {
                this.user.error = null;
            }
        },
        validatePassword() {
            if (this.password.value.length < 8) {
                this.password.error = '8 characters min';
            } else {
                this.password.error = null;
            }
        },
        createEntry() {
            this.validateName();
            this.validateUser();
            this.validatePassword();

            if (!this.name.error && !this.user.error && !this.password.error) {
                this.db.add(
                    this.name.value,
                    this.user.value,
                    this.password.value,
                )
                this.db.save()
                    .then(() => {
                        this.$emit('notice', 'success', 'Entry created successfully');
                        this.$emit('pageChange', 'Database', { db: this.state.db });
                    })
            }
        },
        deleteEntry() {
            this.db.remove(this.state.entry);
            this.db.save()
                .then(() => {
                    this.$emit('notice', 'success', 'Entry deleted successfully');
                    this.$emit('pageChange', 'Database', { db: this.state.db });
                });
        },
        updateEntry() {
            this.validateName();
            this.validateUser();

            if (this.password.value !== '') {
                this.validatePassword();
            }

            if (!this.name.error && !this.user.error && !this.password.error) {
                const password = this.password.value !== '' ? this.password.value : this.db.get(this.state.entry).password;

                this.db.remove(this.state.entry);
                this.db.add(
                    this.name.value,
                    this.user.value,
                    password,
                );

                this.db.save()
                    .then(() => {
                        this.$emit('notice', 'success', 'Database updated successfully');
                        this.$emit('pageChange', 'Database', { db: this.state.db });
                    })
            }
        },
        executeAction() {
            if (!this.dbStore.get(this.state.db)) {
                this.$emit('sessionExpired');
                return;
            }

            switch (this.state.action) {
                case 'delete':
                    this.deleteEntry();
                    break;
                case 'create':
                    this.createEntry();
                    break;
                case 'edit':
                    this.updateEntry();
                    break;
            }
        }
    }
}
</script>

<style>
</style>
