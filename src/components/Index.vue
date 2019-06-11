<template>
    <div class="main">
        <div class="form-group mod-action">
            <button class="form-action" @click="$emit('pageChange', 'DatabaseEdit', { action: 'create' })">
                Create new
            </button>
            <button class="form-action" @click="$emit('pageChange', 'DatabaseSync', { action: 'import' })">
                Import
            </button>
        </div>

        <ul class="boxes" v-if="dbs.length > 0">
            <li class="box" v-for="db in dbs" :key="db">
                <div class="box-item">
                    <h2 class="item-name mod-title" @click="$emit('pageChange', 'Database', { db })">
                        {{ db }}
                    </h2>
                    <DownloadIcon
                        class="item-action"
                        @click="$emit('pageChange', 'DatabaseSync', { db, action: 'export' })" />
                    <Edit2Icon
                        class="item-action mod-edit"
                        @click="$emit('pageChange', 'DatabaseEdit', { db, action: 'edit' })" />
                    <Trash2Icon
                        class="item-action mod-delete"
                        @click="$emit('pageChange', 'DatabaseEdit', { db, action: 'delete' })" />
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import * as Db from '../db.js';
import { Edit2Icon, Trash2Icon, DownloadIcon } from 'vue-feather-icons';

export default {
    data: () => ({
        dbs: Db.list(),
    }),
    components: {
        Edit2Icon,
        Trash2Icon,
        DownloadIcon,
    },
}
</script>

<style lang="scss">
</style>
