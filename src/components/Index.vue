<template>
    <div class="main">
        <div class="form-group mod-action">
            <button class="form-action" @click="$emit('pageChange', 'DatabaseEdit')">Create new</button>
        </div>

        <ul class="dbs" v-if="dbs.length > 0">
            <li class="db" v-for="db in dbs" :key="db">
                <h2 class="db-name" @click="$emit('pageChange', 'Database', db)">{{ db }}</h2>
                <Edit2Icon class="db-action mod-edit" @click="$emit('pageChange', 'DatabaseEdit', db)" />
                <Trash2Icon class="db-action mod-delete" />
            </li>
        </ul>
    </div>
</template>

<script>
import * as Db from '../db.js';
import { Edit2Icon, Trash2Icon } from 'vue-feather-icons';

export default {
    data: () => ({
        dbs: Db.list(),
    }),
    components: {
        Edit2Icon,
        Trash2Icon,
    }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';

.dbs {
    list-style: none;
    margin: 0;
    padding: 0;
}

.db {
    width: 100%;
    box-shadow: 0 0 1.5rem rgba(0, 0, 0, .1);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    margin-bottom: 3rem;
}

.db-name {
    font-size: 1.6rem;
    padding: 2rem;
    width: 100%;
    cursor: pointer;
    margin: 0;

    &:hover {
        text-decoration: underline;
    }
}

.db-action {
    cursor: pointer;
    box-sizing: content-box;
    padding: 1rem;
    border-radius: .5rem;

    &:last-of-type {
        margin-right: 1rem;
    }

    &:hover {
        box-shadow: 0 0 1rem rgba(0, 0, 0, .1);
    }

    &.mod-edit {
        color: $color-blue;

        &:hover {
            background: $bg-blue;
        }
    }

    &.mod-delete {
        color: $color-red;

        &:hover {
            background: $bg-red;
        }
    }
}


</style>
