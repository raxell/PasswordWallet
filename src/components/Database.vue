<template>
    <div class="main">
        <div class="form-group mod-action">
            <button class="form-action" @click="$emit('pageChange', 'EntryEdit', { db: state.db, action: 'create' })">
                Create new
            </button>
        </div>

        <ul class="boxes" v-if="entries.length > 0">
            <li class="box" v-for="entry in entries" :key="entry.name">
                <div class="box-item">
                    <h2 class="item-name mod-title">{{ entry.name }}</h2>
                    <Edit2Icon
                        class="item-action mod-edit"
                        @click="$emit('pageChange', 'EntryEdit', { db: state.db, entry: entry.name, action: 'edit' })" />
                    <Trash2Icon
                        class="item-action mod-delete"
                        @click="$emit('pageChange', 'EntryEdit', { db: state.db, entry: entry.name, action: 'delete' })" />
                </div>
                <div class="box-item">
                    <div class="item-name">{{ entry.user }}</div>
                    <CopyIcon
                        class="item-action"
                        @click="copy(entry.user)" />
                </div>
                <div class="box-item">
                    <div class="item-name mod-password">**************</div>
                    <CopyIcon
                        class="item-action"
                        @click="copy(entry.password)" />
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { Edit2Icon, Trash2Icon, CopyIcon } from 'vue-feather-icons';

export default {
    created() {
        this.entries = this.dbStore.get(this.state.db).entries();
    },
    props: [
        'dbStore',
        'state',
    ],
    data: () => ({
        entries: [],
    }),
    methods: {
        copy(value) {
            const input = document.createElement('input');
            input.value = value;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);

            this.$emit('notice', 'success', 'Copied');
        },
    },
    components: {
        Edit2Icon,
        Trash2Icon,
        CopyIcon,
    },
}
</script>

<style>

</style>
