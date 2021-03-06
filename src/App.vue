<template>
    <div id="app">
        <header class="header">
            <div class="header-logo" @click="navigateTo('Index')">PasswordWallet</div>
            <div class="header-page">{{ title }}</div>
        </header>

        <transition name="fade">
            <div class="notice" :class="`mod-${notice.type}`" v-if="notice">{{ notice.msg }}</div>
        </transition>

        <component
            v-if="supportWebCrypto()"
            :is="currentPage"
            :dbStore="dbStore"
            :state="pageState"
            @notice="addNotice"
            @pagePrev="navigatePrev"
            @pageChange="navigateTo"
            @sessionExpired="needReauthentication"/>

        <div class="notice mod-error" v-else>Your browser does not support Web Crypto API, update it to use the App.</div>
    </div>
</template>

<script>
import DbStore from './db-store.js';

import Index from './components/Index.vue';
import Auth from './components/Auth.vue';
import Database from './components/Database.vue';
import DatabaseEdit from './components/DatabaseEdit.vue';
import DatabaseSync from './components/DatabaseSync.vue';
import EntryEdit from './components/EntryEdit.vue';

export default {
    name: 'app',
    created() {
        this.navigateTo('Index');
    },
    data: () => ({
        currentPage: '',
        prevPage: '',
        title: '',
        dbStore: DbStore(),
        pageState: {
            db: null,
            entry: null,
            action: null,
        },
        notice: null,
    }),
    methods: {
        supportWebCrypto() {
            return window.crypto && window.crypto.subtle;
        },
        needReauthentication() {
            this.navigateTo(this.currentPage, this.pageState);
        },
        navigateTo(page, pageState = {}) {
            this.prevPage = this.currentPage;
            this.pageState = pageState;

            if (!pageState.db || this.dbStore.get(pageState.db)) {
                this.currentPage = page;
                this.title = this.titleOf(page);
            } else {
                this.addNotice('error', 'Session expired, reauthentication needed');
                this.prevPage = page;
                this.currentPage = 'Auth';
                this.title = this.titleOf('Auth');
            }

            document.title = this.title;
        },
        navigatePrev() {
            this.navigateTo(this.prevPage, this.pageState);
        },
        titleOf(page) {
            const editTitle = (entityType, entityName) => ({
                'create': `Create new ${entityType}`,
                'delete': `Delete "${entityName}"`,
                'edit': `Edit "${entityName}"`,
            });

            return {
                'Index': 'Your Databases',
                'Auth': `Unlock "${this.pageState.db}"`,
                'Database': this.pageState.db,
                'DatabaseEdit': editTitle('Database', this.pageState.db)[this.pageState.action],
                'DatabaseSync': this.pageState.action === 'export' ? `Export "${this.pageState.db}"` : 'Import database',
                'EntryEdit': editTitle('Entry', this.pageState.entry)[this.pageState.action],
            }[page];
        },
        addNotice(type, msg) {
            this.notice = { type, msg };

            setTimeout(() => {
                this.notice = null;
            }, 4000);
        }
    },
    components: {
        Index,
        Auth,
        Database,
        DatabaseEdit,
        DatabaseSync,
        EntryEdit,
    },
}
</script>

<style lang="scss">
@import './assets/variables';

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
    color: #555;
}

#app {
    margin: 0 auto;
    padding: 0 .5rem;
    max-width: 50rem;
}

.header {
    position: relative;
    margin-bottom: 3rem;
}

.header-logo {
    padding: 2.5rem 2rem 2rem;
    border-radius: 0 0 1rem 1rem;
    z-index: 10;
    position: absolute;
    background: #fff;
    width: calc(100% - 1rem);
    margin: 0 .5rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
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

.notice {
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 2rem;

    &.mod-error {
        color: $color-red;
        background: $bg-red;
    }

    &.mod-success {
        color: $color-blue;
        background: $bg-blue;
    }
}

/**
 * Transition component classes
 */

.fade-enter-active,
.fade-leave-active {
    transition: opacity .5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
