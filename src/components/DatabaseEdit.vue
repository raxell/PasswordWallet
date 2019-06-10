<template>
    <form id="create-db" @submit.prevent="executeAction()">
        <template v-if="state.action === 'create' || state.action === 'edit'">
            <div class="form-group">
                <label class="form-control-desc" for="name">Database name</label>
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
                <label class="form-control-desc" for="password">{{ state ? 'New' : 'Database' }} password</label>
                <div class="form-control-error" v-if="password.error">{{ password.error }}</div>
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
        </template>

        <div class="form-group" v-else-if="state.action === 'delete'">
            <button class="form-action mod-confirm" type="submit">Confirm deletion</button>
        </div>
    </form>
</template>

<script>
export default {
    created() {
        this.name.value = this.state.db || '';
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
        createDb() {
            this.validateName();
            this.validatePassword(this.password);

            if (!this.name.error && !this.password.error) {
                this.dbStore.auth(this.name.value, this.password.value)
                    .then((db) => {
                        if (!db) {
                            // @TODO: handle error
                            return;
                        }

                        this.$emit('notice', 'success', 'Database created successfully');
                        this.$emit('pageChange', 'Index');
                    })
            }
        },
        deleteDb() {
            this.dbStore.remove(this.state.db, { fromDisk: true })

            this.$emit('notice', 'success', 'Database deleted successfully');
            this.$emit('pageChange', 'Index');
        },
        updateDb() {
            this.validateName();

            if (this.password.value !== '') {
                this.validatePassword();
            }

            if (!this.name.error && !this.password.error) {
                this.dbStore.update({
                    oldName: this.state.db,
                    newName: this.name.value,
                    newPassword: this.password.value,
                })
                    .then(() => {
                        this.$emit('notice', 'success', 'Database updated successfully');
                        this.$emit('pageChange', 'Index');
                    })
            }
        },
        executeAction() {
            switch (this.state.action) {
                case 'delete':
                    this.deleteDb();
                    break;
                case 'create':
                    this.createDb();
                    break;
                case 'edit':
                    this.updateDb();
                    break;
            }
        }
    }
}
</script>

<style>
</style>
