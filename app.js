const { createApp, ref, onMounted, onUnmounted, nextTick } = Vue;

createApp({
    setup() {
        const gameState = ref('start'); // start, playing, gameover, victory
        const successCount = ref(0);
        const isPersonLookingUp = ref(false);
        const isThrowing = ref(false);
        const hasThrown = ref(false);
        const isTrashFalling = ref(false);
        const trashPosition = ref({ x: 0, y: 0 });
        const isGameReady = ref(false);
        
        let lookInterval = null;
        let trashAnimation = null;

        // 行人随机往上看的逻辑
        const startLookingCycle = () => {
            isPersonLookingUp.value = false;
            
            const cycle = () => {
                const shouldLookUp = Math.random() < 0.3;
                isPersonLookingUp.value = shouldLookUp;
                
                const duration = shouldLookUp 
                    ? (Math.random() * 1000 + 1000) 
                    : (Math.random() * 2000 + 2000);
                
                lookInterval = setTimeout(cycle, duration);
            };
            
            lookInterval = setTimeout(cycle, 1500);
        };

        const stopLookingCycle = () => {
            if (lookInterval) {
                clearTimeout(lookInterval);
                lookInterval = null;
            }
        };

        // 开始游戏
        const startGame = () => {
            gameState.value = 'start';
            isGameReady.value = false;
            
            nextTick(() => {
                gameState.value = 'playing';
                successCount.value = 0;
                isThrowing.value = false;
                hasThrown.value = false;
                isTrashFalling.value = false;
                isPersonLookingUp.value = false;
                
                setTimeout(() => {
                    isGameReady.value = true;
                    startLookingCycle();
                }, 100);
            });
        };

        // 扔垃圾
        const throwTrash = () => {
            if (!isGameReady.value || isThrowing.value || hasThrown.value || gameState.value !== 'playing') return;
            
            if (isPersonLookingUp.value) {
                gameState.value = 'gameover';
                isGameReady.value = false;
                stopLookingCycle();
                return;
            }
            
            isThrowing.value = true;
            hasThrown.value = true;
            
            isTrashFalling.value = true;
            trashPosition.value = { x: 215, y: 250 };
            
            let y = 250;
            trashAnimation = setInterval(() => {
                y += 8;
                trashPosition.value = { x: 215, y: y };
                
                if (y > 520) {
                    clearInterval(trashAnimation);
                    isTrashFalling.value = false;
                    isThrowing.value = false;
                    
                    successCount.value++;
                    
                    if (successCount.value >= 5) {
                        gameState.value = 'victory';
                        isGameReady.value = false;
                        stopLookingCycle();
                    } else {
                        setTimeout(() => {
                            hasThrown.value = false;
                        }, 500);
                    }
                }
            }, 20);
        };

        // 点击窗口扔垃圾
        const handleWindowClick = (event) => {
            event.stopPropagation();
            throwTrash();
        };

        // 全局点击事件
        const handleGlobalClick = (event) => {
            if (!isGameReady.value) return;
            if (event.target.closest('.window')) return;
            if (event.target.closest('button')) return;
            
            throwTrash();
        };

        onMounted(() => {
            document.addEventListener('click', handleGlobalClick);
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleGlobalClick);
            stopLookingCycle();
            if (trashAnimation) {
                clearInterval(trashAnimation);
            }
        });

        return {
            gameState,
            successCount,
            isPersonLookingUp,
            isThrowing,
            hasThrown,
            isTrashFalling,
            trashPosition,
            isGameReady,
            startGame,
            handleWindowClick
        };
    }
}).mount('#app');