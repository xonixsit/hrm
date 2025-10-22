<template>
    <div class="logo-container">
        <div class="flex items-center space-x-3">
            <img src="/images/xonobics_logo.png" alt="Xonobics" class="w-12 h-12 object-contain" />
            <div class="text-content">
                <div class="logo-text">Xonobics</div>
                <div class="logo-tagline">HR Management System</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.logo-container {
    display: inline-block;
    position: relative;
}

.text-content {
    display: flex;
    flex-direction: column;
}

.logo-text {
    font-weight: 700;
    font-size: 22px;
    line-height: 1.2;
    color: currentColor;
}

.logo-tagline {
    font-weight: 400;
    font-size: 10px;
    opacity: 0.7;
    color: currentColor;
}
</style>
