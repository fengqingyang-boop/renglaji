const { createApp, ref, onMounted, onUnmounted } = Vue;

createApp({
    setup() {
        const gameState = ref('start'); // start, playing, gameover, victory
        const successCount = ref(0);
        const isPersonLookingUp = ref(false);
        const isThrowing = ref(false);
        const hasThrown = ref(false);
        const isTrashFalling = ref(false);
        const trashPosition = ref({ x: 0, y: 0 });
        
        let lookInterval = null;
        let trashAnimation = null;

        // 行人随机往上看的逻辑
        const startLookingCycle = () => {
            // 首先不看，持续2-4秒
            isPersonLookingUp.value = false;
            
            const cycle = () => {
                // 随机决定是否往上看（70%概率不看，30%概率看）
                const shouldLookUp = Math.random() < 0.3;
                isPersonLookingUp.value = shouldLookUp;
                
                // 持续时间：看的时候1-2秒，不看的时候2-4秒
                const duration = shouldLookUp 
                    ? (Math.random() * 1000 + 1000) 
                    : (Math.random() * 2000 + 2000);
                
                lookInterval = setTimeout(cycle, duration);
            };
            
            // 初始延迟后开始循环
            lookInterval = setTimeout(cycle, 1500);
        };

        // 停止看的循环
        const stopLookingCycle = () => {
            if (lookInterval) {
                clearTimeout(lookInterval);
                lookInterval = null;
            }
        };

        // 开始游戏
        const startGame = () => {
            gameState.value = 'playing';
            successCount.value = 0;
            isThrowing.value = false;
            hasThrown.value = false;
            isTrashFalling.value = false;
            isPersonLookingUp.value = false;
            startLookingCycle();
        };

        // 扔垃圾
        const throwTrash = () => {
            if (isThrowing.value || hasThrown.value || gameState.value !== 'playing') return;
            
            // 检查是否被发现
            if (isPersonLookingUp.value) {
                // 被发现，游戏结束
                gameState.value = 'gameover';
                stopLookingCycle();
                return;
            }
            
            // 成功扔垃圾
            isThrowing.value = true;
            hasThrown.value = true;
            
            // 垃圾下落动画
            isTrashFalling.value = true;
            trashPosition.value = { x: 200, y: 150 };
            
            let y = 150;
            trashAnimation = setInterval(() => {
                y += 5;
                trashPosition.value = { x: 200, y: y };
                
                if (y > 500) {
                    clearInterval(trashAnimation);
                    isTrashFalling.value = false;
                    isThrowing.value = false;
                    
                    // 增加成功计数
                    successCount.value++;
                    
                    // 检查是否胜利
                    if (successCount.value >= 5) {
                        gameState.value = 'victory';
                        stopLookingCycle();
                    } else {
                        // 重置状态，准备下一次扔垃圾
                        setTimeout(() => {
                            hasThrown.value = false;
                        }, 500);
                    }
                }
            }, 20);
        };

        // 点击窗口扔垃圾
        const handleWindowClick = () => {
            throwTrash();
        };

        onMounted(() => {
            // 监听鼠标左键点击
            document.addEventListener('click', (e) => {
                if (gameState.value === 'playing') {
                    throwTrash();
                }
            });
        });

        onUnmounted(() => {
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
            startGame,
            handleWindowClick
        };
    }
}).mount('#app');