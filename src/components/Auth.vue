<template>
    <div class="form-group">
        <label class="form-control-desc" for="password">Password to unlock</label>
        <input id="password" class="form-control" type="text" placeholder="Password...">
        <ArrowRightIcon class="form-control-icon"/>
    </div>
</template>

<script>
import { ArrowRightIcon } from 'vue-feather-icons';

export default {
    created() {
        this.$emit('pageChange', {
            title: 'Unlock database',
        });
    },
    components: {
        ArrowRightIcon,
    },
};
</script>

<style>

</style>
