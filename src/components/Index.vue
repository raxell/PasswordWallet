<template>
    <ul class="dbs">
        <li class="db">
            <h2 class="db-name">Social</h2>
            <Edit2Icon class="db-action mod-edit" data-title="Edit"/>
            <Trash2Icon class="db-action mod-delete" title="Delete"/>
        </li>
        <li class="db">
            <h2 class="db-name">Social</h2>
            <Edit2Icon class="db-action mod-edit" title="Edit"/>
            <Trash2Icon class="db-action mod-delete" title="Delete"/>
        </li>
    </ul>
</template>

<script>
import { Edit2Icon, Trash2Icon } from 'vue-feather-icons';

export default {
    components: {
        Edit2Icon,
        Trash2Icon,
    }
}
</script>

<style lang="scss">
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
        color: #73bafd;

        &:hover {
            background: lighten(#73bafd, 20%);
        }
    }

    &.mod-delete {
        color: #bf517d;

        &:hover {
            background: lighten(#bf517d, 37.5%);
        }
    }
}


</style>
