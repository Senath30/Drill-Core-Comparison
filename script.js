class ImageComparisonGrid {
    constructor() {
        this.dryImages = [];
        this.wetImages = [];
        this.maxImages = 15;
        this.sliderPositions = {};
        this.initializeArrays();
        this.initializeEventListeners();
    }

    initializeArrays() {
        this.dryImages = new Array(this.maxImages).fill(null);
        this.wetImages = new Array(this.maxImages).fill(null);
    }

    initializeEventListeners() {
        const dryInput = document.getElementById('dryImages');
        const wetInput = document.getElementById('wetImages');
        const generateBtn = document.getElementById('generateGrid');

        if (dryInput) {
            dryInput.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'dry');
            });
        }

        if (wetInput) {
            wetInput.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'wet');
            });
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateGrid();
            });
        }
    }

    extractFileNumber(filename) {
        const match = filename.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    handleImageUpload(event, type) {
        const target = event.target;
        if (!target.files) return;

        const files = Array.from(target.files);
        const imageArray = type === 'dry' ? this.dryImages : this.wetImages;

        // Reset array
        imageArray.fill(null);

        // Sort files by number in filename
        const sortedFiles = files.sort((a, b) => {
            const numA = this.extractFileNumber(a.name);
            const numB = this.extractFileNumber(b.name);
            return numA - numB;
        });

        sortedFiles.slice(0, this.maxImages).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target && e.target.result) {
                        const fileNumber = this.extractFileNumber(file.name);
                        imageArray[index] = {
                            src: e.target.result,
                            number: fileNumber,
                            name: file.name
                        };
                        this.updateUploadStatus();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateUploadStatus() {
        const dryLabel = document.querySelector('label[for="dryImages"]');
        const wetLabel = document.querySelector('label[for="wetImages"]');
        const generateBtn = document.getElementById('generateGrid');

        if (dryLabel) {
            const dryCount = this.dryImages.filter(img => img !== null).length;
            dryLabel.textContent = `Dry Images (${dryCount}/15)`;
        }

        if (wetLabel) {
            const wetCount = this.wetImages.filter(img => img !== null).length;
            wetLabel.textContent = `Wet Images (${wetCount}/15)`;
        }

        if (generateBtn) {
            const hasImages = this.dryImages.some(img => img !== null) || 
                            this.wetImages.some(img => img !== null);
            generateBtn.disabled = !hasImages;
        }
    }

    generateGrid() {
        const gridContainer = document.getElementById('imageGrid');
        const comparisonGrid = document.getElementById('comparisonGrid');

        if (!gridContainer || !comparisonGrid) return;

        gridContainer.innerHTML = '';

        // Create matched pairs
        const pairs = [];
        for (let i = 0; i < this.maxImages; i++) {
            const dryImg = this.dryImages[i];
            const wetImg = this.wetImages[i];

            if (dryImg || wetImg) {
                // Determine the set number based on file numbers
                let setNumber = i + 1;
                if (dryImg && wetImg) {
                    // Use the file number if both exist
                    setNumber = Math.min(dryImg.number, wetImg.number) || (i + 1);
                } else if (dryImg) {
                    setNumber = dryImg.number || (i + 1);
                } else if (wetImg) {
                    setNumber = wetImg.number || (i + 1);
                }

                pairs.push({
                    dry: dryImg,
                    wet: wetImg,
                    setNumber: setNumber,
                    index: i
                });
            }
        }

        // Sort pairs by set number
        pairs.sort((a, b) => a.setNumber - b.setNumber);

        // Create image sets
        pairs.forEach((pair) => {
            this.createImageSet(gridContainer, pair);
        });

        comparisonGrid.style.display = 'block';
        
        // Initialize sliders after grid is created
        this.initializeSliders();
        
        comparisonGrid.scrollIntoView({ behavior: 'smooth' });
    }

    createImageSet(container, pair) {
        const setDiv = document.createElement('div');
        setDiv.className = 'image-set';
        setDiv.dataset.setIndex = pair.index;

        // Set number label
        const setNumber = document.createElement('div');
        setNumber.className = 'set-number';
        setNumber.textContent = `Set ${pair.setNumber}`;
        setDiv.appendChild(setNumber);

        // Dry image row
        const dryRow = document.createElement('div');
        dryRow.className = 'image-row dry-row';

        if (pair.dry) {
            const dryImg = document.createElement('img');
            dryImg.src = pair.dry.src;
            dryImg.alt = `Dry image ${pair.setNumber}`;
            dryRow.appendChild(dryImg);

            const dryLabel = document.createElement('div');
            dryLabel.className = 'image-label';
            dryLabel.textContent = 'DRY';
            dryRow.appendChild(dryLabel);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder';
            placeholder.textContent = `Dry ${pair.setNumber}`;
            dryRow.appendChild(placeholder);
        }

        // Wet image row
        const wetRow = document.createElement('div');
        wetRow.className = 'image-row wet-row';

        if (pair.wet) {
            const wetImg = document.createElement('img');
            wetImg.src = pair.wet.src;
            wetImg.alt = `Wet image ${pair.setNumber}`;
            wetRow.appendChild(wetImg);

            const wetLabel = document.createElement('div');
            wetLabel.className = 'image-label';
            wetLabel.textContent = 'WET';
            wetRow.appendChild(wetLabel);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder';
            placeholder.textContent = `Wet ${pair.setNumber}`;
            wetRow.appendChild(placeholder);
        }

        setDiv.appendChild(dryRow);
        setDiv.appendChild(wetRow);

        // Add slider overlay
        const sliderOverlay = document.createElement('div');
        sliderOverlay.className = 'slider-overlay';

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        sliderContainer.dataset.setIndex = pair.index;

        const sliderLine = document.createElement('div');
        sliderLine.className = 'slider-line';

        const sliderHandle = document.createElement('div');
        sliderHandle.className = 'slider-handle';

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = 'Drag to move';

        sliderContainer.appendChild(sliderLine);
        sliderContainer.appendChild(sliderHandle);
        sliderContainer.appendChild(tooltip);
        sliderOverlay.appendChild(sliderContainer);
        setDiv.appendChild(sliderOverlay);

        container.appendChild(setDiv);

        // Initialize slider position for this set
        this.sliderPositions[pair.index] = 50;
    }

    initializeSliders() {
        const sliderContainers = document.querySelectorAll('.slider-container');
        sliderContainers.forEach((container) => {
            this.setupSliderEvents(container);
        });
    }

    setupSliderEvents(sliderContainer) {
        const setIndex = parseInt(sliderContainer.dataset.setIndex);
        const imageSet = sliderContainer.closest('.image-set');
        const sliderLine = sliderContainer.querySelector('.slider-line');
        const sliderHandle = sliderContainer.querySelector('.slider-handle');
        
        let isDragging = false;

        // Mouse events
        [sliderLine, sliderHandle].forEach(element => {
            if (element) {
                element.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    document.body.style.cursor = 'ew-resize';
                    e.preventDefault();
                });
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.updateSliderPosition(e.clientX, imageSet, setIndex);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = 'default';
            }
        });

        // Touch events for mobile
        [sliderLine, sliderHandle].forEach(element => {
            if (element) {
                element.addEventListener('touchstart', (e) => {
                    isDragging = true;
                    e.preventDefault();
                });
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            this.updateSliderPosition(e.touches[0].clientX, imageSet, setIndex);
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Click on image set to move slider
        imageSet.addEventListener('click', (e) => {
            if (e.target.closest('.slider-container')) return;
            this.updateSliderPosition(e.clientX, imageSet, setIndex);
        });
    }

    updateSliderPosition(clientX, imageSet, setIndex) {
        const rect = imageSet.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        
        this.sliderPositions[setIndex] = percentage;

        // Update slider visual position
        const sliderContainer = imageSet.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.style.left = `${percentage}%`;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageComparisonGrid();
});
