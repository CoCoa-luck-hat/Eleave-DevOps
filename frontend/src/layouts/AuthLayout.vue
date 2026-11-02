<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute()
const isSignIn = computed(() => route.path === '/login' || route.path === '/')

</script>


<template>
    <div class="min-h-screen bg-slate-100/80 relative flex flex flex-col justify-between overflow-x-hidden font-kanit">

        <header class="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-30">
            <div class="flex items-center gap-2.5">
                <div class="w-10  h-10 rounded-2xl bg-brand-teal flex items-center justify-center text-white shadow-md">
                    <i class="mdi mdi-exit-run text-2xl"></i>
                </div>
                <div class="">
                    <span class="font-extrabold text-xl text-slate-800 tracking-tight">E-Leave</span>
                    <span class="text-xs text-slate-500 hidden sm:inline ml-2">ระบบลางานออนไลน์</span>
                </div>
            </div>

            <div class="">
                <router-link v-if="isSignIn" to="/register"
                    class="btn bg-brand-navy hover:bg-slate-800 text-white border-none rounded-2xl px-6 sm:px-8 text-sm shadow-sm">สมัครสมาชิก</router-link>
                <router-link v-else to="/login"
                    class="btn bg-brand-navy hover:bg-slate-800 text-white border-none rounded-2xl px-6 sm:px-8 text-sm shadow-sm">เข้าสู่ระบบ</router-link>

            </div>
        </header>

        <main class="flex-1 flex items-center justify-center px-4 py-6 z-10 w-full max-w-5xl mx-auto">
            <div
                class="relative w-full min-h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row">

                <div class="hidden lg:flex absolute top-0 bottom-0 w-1/2 bg-brand-teal transition-all duration-700 ease-in-out z-20 flex-col item-center justify-center p-12 text-brand-navy"
                    :class="isSignIn ? 'left-1/2 rounded-l-[40px] shadow-2xl' : 'left-0 rounded-r-[40px] shadow-2xl'">

                    <div v-if="isSignIn" class="flex flex-col items-center text-center max-w-sm">
                        <div
                            class="w-24 h-24 rounded-3xl bg-white/30 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner text-brand-navy">
                            <i class="mdi mdi-exit-run text-6xl"></i>
                        </div>
                        <h2 class="text-3xl font-extrablod tracking-tight mb-3">
                            ยินดีต้อนรับกลับมา
                        </h2>
                        <p class="text-brand-navy/80 text-base font-medium leading-relaxed mb-6">
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Debitis, atque!
                        </p>
                    </div>
                    <div v-else class="flex flex-col items-center text-center max-w-sm">
                        <div
                            class="w-24 h-24 rounded-3xl bg-white/30 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner text-brand-navy">
                            <i class="mdi mdi-exit-run text-6xl"></i>
                        </div>
                        <h2 class="text-3xl font-extrablod tracking-tight mb-3">
                            สมัครสมาชิก
                        </h2>
                        <p class="text-brand-navy/80 text-base font-medium leading-relaxed mb-6">
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Debitis, atque!
                        </p>
                    </div>
                </div>
                <div class="w-full flex items-center justify-center transition-all duration-700 ease-in-out"
                    :class="isSignIn ? 'lg:justify-start' : 'lg:justify-end'">
                    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 z-10">
                        <router-view v-slot="{ Component }">
                            <transition name="auth-fade" mode="out-in">
                                <component :is="Component" :key="route.name"></component>
                            </transition>
                        </router-view>
                    </div>
                </div>

            </div>


        </main>
    </div>
</template>

<style>
.auth-fade-enter-active,
.auth-fade-leave-active {
    transition: opacity 0.3s ease;
}

.auth-fade-enter-from {
    opacity: 0;
}

.auth-fade-leave-to {
    opacity: 0;
}
</style>