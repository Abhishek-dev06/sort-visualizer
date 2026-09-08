"use strict";

/*
    SORTLAB
    ------------------------------------------------
    Sorting Algorithm Visualizer
    Pure Vanilla JavaScript

    Algorithms:
    1. Bubble Sort
    2. Selection Sort
    3. Insertion Sort
    4. Merge Sort
    5. Quick Sort
    6. Heap Sort

    Every algorithm is async so we can pause between
    operations and visually display the algorithm.
*/


/* ==================================================
   DOM ELEMENTS
================================================== */

const barsContainer = document.getElementById("bars");

const barsA = document.getElementById("barsA");
const barsB = document.getElementById("barsB");

const algorithmSelect = document.getElementById("algorithm");

const algorithmA = document.getElementById("algorithmA");
const algorithmB = document.getElementById("algorithmB");

const arraySizeSlider = document.getElementById("arraySize");
const speedSlider = document.getElementById("speed");

const arraySizeValue = document.getElementById("arraySizeValue");
const speedValue = document.getElementById("speedValue");

const generateBtn = document.getElementById("generateBtn");
const startBtn = document.getElementById("startBtn");
const soundBtn = document.getElementById("soundBtn");

const singleView = document.getElementById("singleView");
const raceView = document.getElementById("raceView");

const modeButtons = document.querySelectorAll(".mode-btn");

const singleAlgorithmTitle =
    document.getElementById("singleAlgorithmTitle");

const statusBadge =
    document.getElementById("statusBadge");

const comparisonsElement =
    document.getElementById("comparisons");

const swapsElement =
    document.getElementById("swaps");

const timeElement =
    document.getElementById("time");

const elementCountElement =
    document.getElementById("elementCount");


/* Race statistics */

const comparisonsAElement =
    document.getElementById("comparisonsA");

const swapsAElement =
    document.getElementById("swapsA");

const timeAElement =
    document.getElementById("timeA");

const comparisonsBElement =
    document.getElementById("comparisonsB");

const swapsBElement =
    document.getElementById("swapsB");

const timeBElement =
    document.getElementById("timeB");

const raceTitleA =
    document.getElementById("raceTitleA");

const raceTitleB =
    document.getElementById("raceTitleB");

const raceStatusA =
    document.getElementById("raceStatusA");

const raceStatusB =
    document.getElementById("raceStatusB");

const raceMessage =
    document.getElementById("raceMessage");


/* ==================================================
   GLOBAL STATE
================================================== */

let array = [];

let currentMode = "single";

let isSorting = false;

let soundEnabled = true;

let audioContext = null;


/*
    Each race panel gets its own statistics.
*/

const raceStats = {
    A: {
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        elapsed: 0,
        finished: false
    },

    B: {
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        elapsed: 0,
        finished: false
    }
};


/* ==================================================
   ALGORITHM NAMES
================================================== */

const algorithmNames = {
    bubble: "Bubble Sort",
    selection: "Selection Sort",
    insertion: "Insertion Sort",
    merge: "Merge Sort",
    quick: "Quick Sort",
    heap: "Heap Sort"
};


/* ==================================================
   SPEED
================================================== */

/*
    Slider:
    1 = very slow
    2 = slow
    3 = medium
    4 = fast
    5 = very fast

    delay is calculated dynamically.
*/

function getDelay() {

    const speed = Number(speedSlider.value);

    const delays = {
        1: 180,
        2: 90,
        3: 45,
        4: 18,
        5: 5
    };

    return delays[speed];
}


function updateSpeedLabel() {

    const names = {
        1: "Very Slow",
        2: "Slow",
        3: "Medium",
        4: "Fast",
        5: "Very Fast"
    };

    speedValue.textContent =
        names[speedSlider.value];
}


/*
    Promise-based delay.

    Every sorting algorithm uses:
        await delay();
*/

function delay(ms = getDelay()) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


/* ==================================================
   ARRAY GENERATION
================================================== */

function generateArray() {

    const size =
        Number(arraySizeSlider.value);

    array = [];

    for (let i = 0; i < size; i++) {

        /*
            Values between 10 and 100.
        */

        const value =
            Math.floor(Math.random() * 91) + 10;

        array.push(value);
    }

    renderAll();

    resetStats();

    setStatus("Ready");
}


/* ==================================================
   BAR RENDERING
================================================== */

function renderBars(container, values) {

    container.innerHTML = "";

    values.forEach((value, index) => {

        const bar =
            document.createElement("div");

        bar.className = "bar";

        bar.style.height =
            `${value}%`;

        bar.dataset.index = index;

        bar.dataset.value = value;

        container.appendChild(bar);
    });
}


function renderAll() {

    renderBars(barsContainer, array);

    renderBars(barsA, array);

    renderBars(barsB, array);

    elementCountElement.textContent =
        array.length;
}


/* ==================================================
   BAR STATE HELPERS
================================================== */

function getBars(container) {

    return [...container.children];
}


function clearBarState(bar) {

    if (!bar) return;

    bar.classList.remove(
        "comparing",
        "swapping",
        "sorted",
        "partition",
        "merging"
    );
}


function clearAllBarStates(container) {

    getBars(container).forEach(bar => {
        clearBarState(bar);
    });
}


function setBarState(container, index, state) {

    const bars = getBars(container);

    if (!bars[index]) return;

    clearBarState(bars[index]);

    bars[index].classList.add(state);
}


/* ==================================================
   UPDATE BAR VALUE
================================================== */

function updateBar(container, index, value) {

    const bars = getBars(container);

    if (!bars[index]) return;

    bars[index].dataset.value = value;

    bars[index].style.height =
        `${value}%`;
}


/* ==================================================
   SOUND
================================================== */

/*
    Web Audio API.

    No external sound files are required.
*/

function initAudio() {

    if (!audioContext) {

        const AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioCtx) return;

        audioContext =
            new AudioCtx();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


/*
    value controls pitch.

    Larger value = higher frequency.
*/

function playComparisonSound(value) {

    if (!soundEnabled) return;

    initAudio();

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    const frequency =
        220 + (value / 100) * 660;

    oscillator.frequency.value =
        frequency;

    oscillator.type = "sine";

    gain.gain.setValueAtTime(
        0.025,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.045
    );

    oscillator.connect(gain);

    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.05
    );
}


soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    soundBtn.textContent =
        soundEnabled ? "🔊" : "🔇";

    if (soundEnabled) {
        initAudio();
    }
});


/* ==================================================
   STATS
================================================== */

let singleStats = {
    comparisons: 0,
    swaps: 0,
    startTime: 0,
    elapsed: 0
};


function resetStats() {

    singleStats = {
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        elapsed: 0
    };

    comparisonsElement.textContent = "0";
    swapsElement.textContent = "0";
    timeElement.textContent = "0";

    raceStats.A = {
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        elapsed: 0,
        finished: false
    };

    raceStats.B = {
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        elapsed: 0,
        finished: false
    };

    comparisonsAElement.textContent = "0";
    swapsAElement.textContent = "0";
    timeAElement.textContent = "0";

    comparisonsBElement.textContent = "0";
    swapsBElement.textContent = "0";
    timeBElement.textContent = "0";
}


function updateSingleStats() {

    comparisonsElement.textContent =
        singleStats.comparisons;

    swapsElement.textContent =
        singleStats.swaps;

    if (singleStats.startTime) {

        singleStats.elapsed =
            performance.now() -
            singleStats.startTime;

        timeElement.textContent =
            Math.round(singleStats.elapsed);
    }
}


function updateRaceStats(side) {

    const stats = raceStats[side];

    if (side === "A") {

        comparisonsAElement.textContent =
            stats.comparisons;

        swapsAElement.textContent =
            stats.swaps;

        if (stats.startTime) {

            stats.elapsed =
                performance.now() -
                stats.startTime;

            timeAElement.textContent =
                Math.round(stats.elapsed);
        }

    } else {

        comparisonsBElement.textContent =
            stats.comparisons;

        swapsBElement.textContent =
            stats.swaps;

        if (stats.startTime) {

            stats.elapsed =
                performance.now() -
                stats.startTime;

            timeBElement.textContent =
                Math.round(stats.elapsed);
        }
    }
}


/* ==================================================
   COMPARISON HELPER
================================================== */

async function compareSingle(
    values,
    i,
    j,
    container
) {

    singleStats.comparisons++;

    updateSingleStats();

    setBarState(container, i, "comparing");
    setBarState(container, j, "comparing");

    playComparisonSound(values[i]);

    await delay();

    clearBarState(
        getBars(container)[i]
    );

    clearBarState(
        getBars(container)[j]
    );

    return values[i] > values[j];
}


/*
    Race version of comparison.
*/

async function compareRace(
    values,
    i,
    j,
    container,
    side
) {

    raceStats[side].comparisons++;

    updateRaceStats(side);

    setBarState(container, i, "comparing");
    setBarState(container, j, "comparing");

    playComparisonSound(values[i]);

    await delay();

    clearBarState(
        getBars(container)[i]
    );

    clearBarState(
        getBars(container)[j]
    );
}


/* ==================================================
   SWAP HELPER
================================================== */

async function swapSingle(
    values,
    i,
    j,
    container
) {

    singleStats.swaps++;

    updateSingleStats();

    setBarState(container, i, "swapping");
    setBarState(container, j, "swapping");

    await delay();

    const temp = values[i];

    values[i] = values[j];

    values[j] = temp;

    updateBar(
        container,
        i,
        values[i]
    );

    updateBar(
        container,
        j,
        values[j]
    );

    await delay();

    clearBarState(
        getBars(container)[i]
    );

    clearBarState(
        getBars(container)[j]
    );
}


/* ==================================================
   RACE SWAP
================================================== */

async function swapRace(
    values,
    i,
    j,
    container,
    side
) {

    raceStats[side].swaps++;

    updateRaceStats(side);

    setBarState(container, i, "swapping");
    setBarState(container, j, "swapping");

    await delay();

    const temp = values[i];

    values[i] = values[j];

    values[j] = temp;

    updateBar(
        container,
        i,
        values[i]
    );

    updateBar(
        container,
        j,
        values[j]
    );

    await delay();

    clearBarState(
        getBars(container)[i]
    );

    clearBarState(
        getBars(container)[j]
    );
}


/* ==================================================
   SORTED MARKING
================================================== */

async function markSorted(
    container,
    index
) {

    setBarState(
        container,
        index,
        "sorted"
    );

    await delay(8);
}


async function markAllSorted(container) {

    const bars = getBars(container);

    for (let i = 0; i < bars.length; i++) {

        clearBarState(bars[i]);

        bars[i].classList.add("sorted");

        await delay(7);
    }
}


/* ==================================================
   BUBBLE SORT
================================================== */

/*
    Bubble Sort:

    Compare neighboring elements.

    If left > right:
        swap them.

    After every pass, the largest remaining
    element reaches the end.
*/

async function bubbleSort(
    values,
    container,
    raceSide = null
) {

    const n = values.length;

    for (let i = 0; i < n - 1; i++) {

        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {

            if (raceSide) {

                await compareRace(
                    values,
                    j,
                    j + 1,
                    container,
                    raceSide
                );

            } else {

                await compareSingle(
                    values,
                    j,
                    j + 1,
                    container
                );
            }


            if (values[j] > values[j + 1]) {

                if (raceSide) {

                    await swapRace(
                        values,
                        j,
                        j + 1,
                        container,
                        raceSide
                    );

                } else {

                    await swapSingle(
                        values,
                        j,
                        j + 1,
                        container
                    );
                }

                swapped = true;
            }
        }

        await markSorted(
            container,
            n - i - 1
        );

        if (!swapped) {

            for (let k = 0; k < n - i - 1; k++) {

                await markSorted(
                    container,
                    k
                );
            }

            break;
        }
    }

    await markSorted(container, 0);
}


/* ==================================================
   SELECTION SORT
================================================== */

/*
    Selection Sort:

    Find the minimum element in the unsorted
    portion.

    Then place it at position i.
*/

async function selectionSort(
    values,
    container,
    raceSide = null
) {

    const n = values.length;

    for (let i = 0; i < n - 1; i++) {

        let minIndex = i;

        setBarState(
            container,
            minIndex,
            "comparing"
        );

        for (let j = i + 1; j < n; j++) {

            if (raceSide) {

                await compareRace(
                    values,
                    minIndex,
                    j,
                    container,
                    raceSide
                );

            } else {

                await compareSingle(
                    values,
                    minIndex,
                    j,
                    container
                );
            }


            if (values[j] < values[minIndex]) {

                clearBarState(
                    getBars(container)[minIndex]
                );

                minIndex = j;

                setBarState(
                    container,
                    minIndex,
                    "comparing"
                );
            }
        }


        if (minIndex !== i) {

            if (raceSide) {

                await swapRace(
                    values,
                    i,
                    minIndex,
                    container,
                    raceSide
                );

            } else {

                await swapSingle(
                    values,
                    i,
                    minIndex,
                    container
                );
            }
        }

        await markSorted(
            container,
            i
        );
    }

    await markSorted(
        container,
        n - 1
    );
}


/* ==================================================
   INSERTION SORT
================================================== */

/*
    Insertion Sort:

    The left side is treated as sorted.

    Take one element and move it left until
    it reaches its correct position.
*/

async function insertionSort(
    values,
    container,
    raceSide = null
) {

    const n = values.length;

    if (n === 0) return;

    await markSorted(
        container,
        0
    );

    for (let i = 1; i < n; i++) {

        const key = values[i];

        let j = i - 1;

        setBarState(
            container,
            i,
            "comparing"
        );

        while (j >= 0) {

            if (raceSide) {

                await compareRace(
                    values,
                    j,
                    j + 1,
                    container,
                    raceSide
                );

            } else {

                await compareSingle(
                    values,
                    j,
                    j + 1,
                    container
                );
            }


            if (values[j] > key) {

                values[j + 1] = values[j];

                updateBar(
                    container,
                    j + 1,
                    values[j + 1]
                );

                if (raceSide) {

                    raceStats[raceSide].swaps++;

                    updateRaceStats(raceSide);

                } else {

                    singleStats.swaps++;

                    updateSingleStats();
                }

                setBarState(
                    container,
                    j,
                    "swapping"
                );

                await delay();

                j--;

            } else {

                break;
            }
        }


        values[j + 1] = key;

        updateBar(
            container,
            j + 1,
            key
        );

        clearAllBarStates(container);

        for (let k = 0; k <= i; k++) {

            getBars(container)[k]
                .classList.add("sorted");
        }
    }

    await delay(10);
}


/* ==================================================
   MERGE SORT
================================================== */

/*
    Merge Sort:

    1. Divide array into two halves.
    2. Recursively sort each half.
    3. Merge the two sorted halves.

    The visualization highlights the actual
    merge operation instead of pretending that
    Merge Sort is only a swapping algorithm.
*/

async function mergeSort(
    values,
    container,
    raceSide = null
) {

    await mergeSortRecursive(
        values,
        0,
        values.length - 1,
        container,
        raceSide
    );

    await markAllSorted(container);
}


async function mergeSortRecursive(
    values,
    left,
    right,
    container,
    raceSide
) {

    if (left >= right) {
        return;
    }

    const mid =
        Math.floor((left + right) / 2);


    /*
        Highlight the current divide range.
    */

    for (let i = left; i <= right; i++) {

        setBarState(
            container,
            i,
            "partition"
        );
    }

    await delay();


    await mergeSortRecursive(
        values,
        left,
        mid,
        container,
        raceSide
    );


    await mergeSortRecursive(
        values,
        mid + 1,
        right,
        container,
        raceSide
    );


    await merge(
        values,
        left,
        mid,
        right,
        container,
        raceSide
    );
}


async function merge(
    values,
    left,
    mid,
    right,
    container,
    raceSide
) {

    const leftPart = [];
    const rightPart = [];


    for (let i = left; i <= mid; i++) {

        leftPart.push(values[i]);
    }


    for (let i = mid + 1; i <= right; i++) {

        rightPart.push(values[i]);
    }


    let i = 0;
    let j = 0;
    let k = left;


    /*
        Actual merge process.
    */

    while (
        i < leftPart.length &&
        j < rightPart.length
    ) {

        setBarState(
            container,
            k,
            "merging"
        );


        if (raceSide) {

            raceStats[raceSide].comparisons++;

            updateRaceStats(raceSide);

        } else {

            singleStats.comparisons++;

            updateSingleStats();
        }


        const compareValue =
            i < leftPart.length
                ? leftPart[i]
                : 0;

        playComparisonSound(
            compareValue
        );


        await delay();


        if (leftPart[i] <= rightPart[j]) {

            values[k] = leftPart[i];

            i++;

        } else {

            values[k] = rightPart[j];

            j++;
        }


        /*
            A merge assignment is counted as
            a movement/write rather than a literal
            swap.
        */

        if (raceSide) {

            raceStats[raceSide].swaps++;

            updateRaceStats(raceSide);

        } else {

            singleStats.swaps++;

            updateSingleStats();
        }


        updateBar(
            container,
            k,
            values[k]
        );

        k++;

        await delay();
    }


    while (i < leftPart.length) {

        values[k] = leftPart[i];

        updateBar(
            container,
            k,
            values[k]
        );

        setBarState(
            container,
            k,
            "merging"
        );

        i++;
        k++;

        await delay();
    }


    while (j < rightPart.length) {

        values[k] = rightPart[j];

        updateBar(
            container,
            k,
            values[k]
        );

        setBarState(
            container,
            k,
            "merging"
        );

        j++;
        k++;

        await delay();
    }


    /*
        Mark this merged range as sorted temporarily.
    */

    for (let x = left; x <= right; x++) {

        clearBarState(
            getBars(container)[x]
        );
    }
}


/* ==================================================
   QUICK SORT
================================================== */

/*
    Quick Sort:

    Choose a pivot.

    Partition the array so that:

        values < pivot
        pivot
        values > pivot

    Then recursively sort the left and right
    partitions.

    The pivot gets a special partition color.
*/

async function quickSort(
    values,
    container,
    raceSide = null
) {

    await quickSortRecursive(
        values,
        0,
        values.length - 1,
        container,
        raceSide
    );

    await markAllSorted(container);
}


async function quickSortRecursive(
    values,
    low,
    high,
    container,
    raceSide
) {

    if (low >= high) {

        if (low === high) {

            await markSorted(
                container,
                low
            );
        }

        return;
    }


    const pivotIndex =
        await partition(
            values,
            low,
            high,
            container,
            raceSide
        );


    await markSorted(
        container,
        pivotIndex
    );


    await quickSortRecursive(
        values,
        low,
        pivotIndex - 1,
        container,
        raceSide
    );


    await quickSortRecursive(
        values,
        pivotIndex + 1,
        high,
        container,
        raceSide
    );
}


async function partition(
    values,
    low,
    high,
    container,
    raceSide
) {

    const pivot =
        values[high];


    /*
        Pivot is visually highlighted.
    */

    setBarState(
        container,
        high,
        "partition"
    );

    await delay();


    let i = low;


    for (let j = low; j < high; j++) {

        if (raceSide) {

            await compareRace(
                values,
                j,
                high,
                container,
                raceSide
            );

        } else {

            await compareSingle(
                values,
                j,
                high,
                container
            );
        }


        if (values[j] < pivot) {

            if (i !== j) {

                if (raceSide) {

                    await swapRace(
                        values,
                        i,
                        j,
                        container,
                        raceSide
                    );

                } else {

                    await swapSingle(
                        values,
                        i,
                        j,
                        container
                    );
                }
            }

            i++;
        }
    }


    if (i !== high) {

        if (raceSide) {

            await swapRace(
                values,
                i,
                high,
                container,
                raceSide
            );

        } else {

            await swapSingle(
                values,
                i,
                high,
                container
            );
        }
    }


    return i;
}


/* ==================================================
   HEAP SORT
================================================== */

/*
    Heap Sort:

    1. Build a max heap.
    2. The largest value is now at index 0.
    3. Swap it with the last unsorted element.
    4. Restore the heap.
    5. Repeat.

    heapify recursively pushes a value downward
    until the max-heap property is restored.
*/

async function heapSort(
    values,
    container,
    raceSide = null
) {

    const n = values.length;


    /*
        Build max heap.
    */

    for (
        let i = Math.floor(n / 2) - 1;
        i >= 0;
        i--
    ) {

        await heapify(
            values,
            n,
            i,
            container,
            raceSide
        );
    }


    /*
        Move maximum element to the end.
    */

    for (let end = n - 1; end > 0; end--) {

        if (raceSide) {

            await swapRace(
                values,
                0,
                end,
                container,
                raceSide
            );

        } else {

            await swapSingle(
                values,
                0,
                end,
                container
            );
        }


        await markSorted(
            container,
            end
        );


        await heapify(
            values,
            end,
            0,
            container,
            raceSide
        );
    }


    await markSorted(
        container,
        0
    );
}


async function heapify(
    values,
    heapSize,
    root,
    container,
    raceSide
) {

    let largest = root;

    const left =
        2 * root + 1;

    const right =
        2 * root + 2;


    if (left < heapSize) {

        if (raceSide) {

            await compareRace(
                values,
                left,
                largest,
                container,
                raceSide
            );

        } else {

            await compareSingle(
                values,
                left,
                largest,
                container
            );
        }


        if (values[left] > values[largest]) {

            largest = left;
        }
    }


    if (right < heapSize) {

        if (raceSide) {

            await compareRace(
                values,
                right,
                largest,
                container,
                raceSide
            );

        } else {

            await compareSingle(
                values,
                right,
                largest,
                container
            );
        }


        if (values[right] > values[largest]) {

            largest = right;
        }
    }


    if (largest !== root) {

        if (raceSide) {

            await swapRace(
                values,
                root,
                largest,
                container,
                raceSide
            );

        } else {

            await swapSingle(
                values,
                root,
                largest,
                container
            );
        }


        await heapify(
            values,
            heapSize,
            largest,
            container,
            raceSide
        );
    }
}


/* ==================================================
   ALGORITHM DISPATCHER
================================================== */

async function runAlgorithm(
    algorithm,
    values,
    container,
    raceSide = null
) {

    switch (algorithm) {

        case "bubble":

            await bubbleSort(
                values,
                container,
                raceSide
            );

            break;


        case "selection":

            await selectionSort(
                values,
                container,
                raceSide
            );

            break;


        case "insertion":

            await insertionSort(
                values,
                container,
                raceSide
            );

            break;


        case "merge":

            await mergeSort(
                values,
                container,
                raceSide
            );

            break;


        case "quick":

            await quickSort(
                values,
                container,
                raceSide
            );

            break;


        case "heap":

            await heapSort(
                values,
                container,
                raceSide
            );

            break;
    }
}


/* ==================================================
   SINGLE MODE
================================================== */

function setStatus(text, type = "") {

    statusBadge.textContent = text;

    statusBadge.className =
        "status-badge";

    if (type) {
        statusBadge.classList.add(type);
    }
}


async function startSingleSort() {

    if (isSorting) return;

    isSorting = true;

    document.body.classList.add(
        "sorting-active"
    );

    disableControls(true);

    clearAllBarStates(
        barsContainer
    );

    setStatus(
        "Sorting...",
        "sorting"
    );


    /*
        Make a COPY.

        This is important because the original
        array is kept intact for Race Mode.
    */

    const values =
        [...array];


    singleStats.startTime =
        performance.now();


    /*
        Update timer continuously.
    */

    const timer =
        setInterval(
            updateSingleStats,
            20
        );


    try {

        await runAlgorithm(
            algorithmSelect.value,
            values,
            barsContainer
        );


        singleStats.elapsed =
            performance.now() -
            singleStats.startTime;

        updateSingleStats();

        setStatus(
            "Completed",
            "finished"
        );

    } finally {

        clearInterval(timer);

        isSorting = false;

        document.body.classList.remove(
            "sorting-active"
        );

        disableControls(false);
    }
}


/* ==================================================
   RACE MODE
================================================== */

async function startRace() {

    if (isSorting) return;

    isSorting = true;

    disableControls(true);


    const originalArray =
        [...array];


    /*
        IMPORTANT:
        Both algorithms receive separate copies
        of EXACTLY the same starting array.
    */

    const valuesA =
        [...originalArray];

    const valuesB =
        [...originalArray];


    raceStats.A.startTime =
        performance.now();

    raceStats.B.startTime =
        performance.now();


    raceStats.A.finished = false;
    raceStats.B.finished = false;


    raceTitleA.textContent =
        algorithmNames[algorithmA.value];

    raceTitleB.textContent =
        algorithmNames[algorithmB.value];


    raceStatusA.textContent =
        "Sorting...";

    raceStatusB.textContent =
        "Sorting...";

    raceStatusA.className =
        "status-badge sorting";

    raceStatusB.className =
        "status-badge sorting";


    raceMessage.textContent =
        "Race in progress...";


    const timer =
        setInterval(() => {

            updateRaceStats("A");
            updateRaceStats("B");

        }, 20);


    /*
        Promise.all starts both algorithms at the
        same time.

        They use independent arrays and containers.
    */

    try {

        await Promise.all([

            runRaceAlgorithm(
                algorithmA.value,
                valuesA,
                barsA,
                "A"
            ),

            runRaceAlgorithm(
                algorithmB.value,
                valuesB,
                barsB,
                "B"
            )
        ]);


        raceStats.A.elapsed =
            performance.now() -
            raceStats.A.startTime;

        raceStats.B.elapsed =
            performance.now() -
            raceStats.B.startTime;


        updateRaceStats("A");
        updateRaceStats("B");


        raceStats.A.finished = true;
        raceStats.B.finished = true;


        raceStatusA.textContent =
            "Finished";

        raceStatusB.textContent =
            "Finished";

        raceStatusA.className =
            "status-badge finished";

        raceStatusB.className =
            "status-badge finished";


        /*
            Determine winner using actual elapsed time.
        */

        if (
            raceStats.A.elapsed <
            raceStats.B.elapsed
        ) {

            raceMessage.textContent =
                `${algorithmNames[algorithmA.value]} wins!`;

        } else if (
            raceStats.B.elapsed <
            raceStats.A.elapsed
        ) {

            raceMessage.textContent =
                `${algorithmNames[algorithmB.value]} wins!`;

        } else {

            raceMessage.textContent =
                "It's a tie!";
        }

    } finally {

        clearInterval(timer);

        isSorting = false;

        disableControls(false);
    }
}


/*
    Race dispatcher.

    This is separate from runAlgorithm so
    statistics remain independent.
*/

async function runRaceAlgorithm(
    algorithm,
    values,
    container,
    side
) {

    await runAlgorithm(
        algorithm,
        values,
        container,
        side
    );
}


/* ==================================================
   CONTROLS
================================================== */

function disableControls(disabled) {

    algorithmSelect.disabled =
        disabled;

    algorithmA.disabled =
        disabled;

    algorithmB.disabled =
        disabled;

    arraySizeSlider.disabled =
        disabled;

    speedSlider.disabled =
        disabled;

    generateBtn.disabled =
        disabled;

    startBtn.disabled =
        disabled;
}


generateBtn.addEventListener(
    "click",
    () => {

        if (isSorting) return;

        generateArray();
    }
);


startBtn.addEventListener(
    "click",
    () => {

        if (currentMode === "single") {

            startSingleSort();

        } else {

            startRace();
        }
    }
);


/* ==================================================
   ARRAY SIZE
================================================== */

arraySizeSlider.addEventListener(
    "input",
    () => {

        arraySizeValue.textContent =
            arraySizeSlider.value;

        if (!isSorting) {
            generateArray();
        }
    }
);


/* ==================================================
   SPEED
================================================== */

speedSlider.addEventListener(
    "input",
    updateSpeedLabel
);


/* ==================================================
   ALGORITHM SELECT
================================================== */

algorithmSelect.addEventListener(
    "change",
    () => {

        singleAlgorithmTitle.textContent =
            algorithmNames[
                algorithmSelect.value
            ];
    }
);


algorithmA.addEventListener(
    "change",
    () => {

        raceTitleA.textContent =
            algorithmNames[
                algorithmA.value
            ];
    }
);


algorithmB.addEventListener(
    "change",
    () => {

        raceTitleB.textContent =
            algorithmNames[
                algorithmB.value
            ];
    }
);


/* ==================================================
   MODE SWITCH
================================================== */

modeButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (isSorting) return;

            const mode =
                button.dataset.mode;

            currentMode =
                mode;


            modeButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );
            });


            button.classList.add(
                "active"
            );


            if (mode === "single") {

                singleView.classList.remove(
                    "hidden"
                );

                raceView.classList.add(
                    "hidden"
                );


                /*
                    Show single-mode controls.
                */

                document
                    .querySelectorAll(".single-control")
                    .forEach(element => {

                        element.style.display =
                            "flex";
                    });


                document
                    .querySelectorAll(".race-control")
                    .forEach(element => {

                        element.style.display =
                            "none";
                    });


                startBtn.innerHTML =
                    "<span>▶</span> Start Sorting";


            } else {

                singleView.classList.add(
                    "hidden"
                );

                raceView.classList.remove(
                    "hidden"
                );


                /*
                    Show Race Mode algorithm selectors.
                */

                document
                    .querySelectorAll(".single-control")
                    .forEach(element => {

                        element.style.display =
                            "none";
                    });


                document
                    .querySelectorAll(".race-control")
                    .forEach(element => {

                        element.style.display =
                            "flex";
                    });


                startBtn.innerHTML =
                    "<span>⚡</span> Start Race";
            }


            /*
                Reset visual state when changing modes.
            */

            resetStats();

            renderAll();

            setStatus("Ready");

            raceStatusA.textContent =
                "Ready";

            raceStatusB.textContent =
                "Ready";

            raceStatusA.className =
                "status-badge";

            raceStatusB.className =
                "status-badge";

            raceMessage.textContent =
                "Same array. Same speed. Different algorithms.";
        }
    );
});


/* ==================================================
   INITIALIZATION
================================================== */

function initialize() {

    updateSpeedLabel();

    arraySizeValue.textContent =
        arraySizeSlider.value;

    singleAlgorithmTitle.textContent =
        algorithmNames[
            algorithmSelect.value
        ];

    raceTitleA.textContent =
        algorithmNames[
            algorithmA.value
        ];

    raceTitleB.textContent =
        algorithmNames[
            algorithmB.value
        ];

    generateArray();
}


/*
    Start application.
*/

initialize();
