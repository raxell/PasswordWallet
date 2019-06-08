<template>
    <div id="app">
        <header class="header">
            <div class="header-logo">PasswordWallet</div>
            <div class="header-page">{{ title }}</div>
        </header>
        <component v-if="supportWebCrypto()" :is="currentPage" @pageChange="navigateTo"/>
        <div class="error-msg" v-else>Your browser does not support Web Crypto API, update it to use the App.</div>
    </div>
</template>

<script>
import Index from './components/Index.vue';
import Auth from './components/Auth.vue';
import DatabaseEdit from './components/DatabaseEdit.vue';

export default {
    name: 'app',
    created() {
        this.navigateTo('Index');
    },
    data: () => ({
        currentPage: '',
        title: '',
    }),
    methods: {
        supportWebCrypto() {
            return window.crypto && window.crypto.subtle;
        },
        navigateTo(page) {
            this.currentPage = page;
            this.title = this.titleOf(page);
        },
        titleOf(page) {
            return {
                'Index': 'Your Databases',
                'Auth': 'Unlock Database',
                'DatabaseEdit': 'Create new database',
            }[page];
        }
    },
    components: {
        Index,
        Auth,
        DatabaseEdit,
    },
}
</script>

<style>
html {
    box-sizing: border-box;
    font-size: 10px;
}

*,
*:before,
*:after {
    box-sizing: inherit;
}

body {
    font-size: 1.6rem;
    margin: 0;
    font-family: 'Montserrat', sans-serif;
    color: #333;
}

#app {
    margin: 0 auto;
    padding: 0 .5rem;
    max-width: 50rem;
}

.header {
    position: relative;
    margin-bottom: 2rem;
}

.header-logo {
    padding: 2.5rem 2rem 2rem;
    border-radius: 0 0 1rem 1rem;
    z-index: 10;
    position: absolute;
    background: #fff;
    width: calc(100% - 1rem);
    margin: 0 .5rem;
}

.header-page {
    border-radius: 0 0 1.5rem 1.5rem;
    background: linear-gradient(45deg, #ffcc64, #fd5889);
    padding: 8rem 0 2rem;
    text-align: center;
    color: #fff;
    margin-top: -1rem;
    font-weight: 600;
}

.error-msg {
    color: #bf517d;
    background: #f6d7e3;
    border-radius: 1rem;
    padding: 2rem;
}

</style>
