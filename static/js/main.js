document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("valuation-form");
    const btnSubmit = document.getElementById("btn-submit");
    const gradeSlider = document.getElementById("input-grade");
    const gradeBadge = document.getElementById("grade-badge-val");
    const latInput = document.getElementById("input-lat");
    const longInput = document.getElementById("input-long");
    
    
    const placeholderPanel = document.getElementById("results-placeholder");
    const loadingPanel = document.getElementById("results-loading");
    const contentPanel = document.getElementById("results-content");
    
    
    const primaryModelLabel = document.getElementById("primary-model-label");
    const primaryPriceVal = document.getElementById("primary-price-val");
    const primaryModelBadge = document.getElementById("primary-model-badge");
    const variantBadge = document.getElementById("variant-badge");
    
    
    const valPricePerSqft = document.getElementById("val-price-per-sqft");
    const valAge = document.getElementById("val-derived-age");
    const valRenov = document.getElementById("val-derived-renov");
    const valBathBed = document.getElementById("val-derived-bathbed");
    
    
    const detailsTableBody = document.querySelector("#models-prediction-table tbody");
    
    
    let chartInstance = null;

    
    const HOUSE_PRESETS = {
        "suburban": {
            title: "Suburban Family",
            desc: "3 Bed • 2 Bath • 2,200 sq ft",
            tagText: "Popular",
            tagClass: "tag-primary",
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>`,
            bedrooms: 3,
            bathrooms: 2,
            floors: 2,
            sqft_living: 2200,
            sqft_lot: 6500,
            sqft_above: 1800,
            sqft_basement: 400,
            waterfront: "N",
            view: 0,
            condition: "Average",
            grade: 8,
            yr_built: 1994,
            yr_renovated: 0,
            lat: 47.6740,
            long: -122.1215
        },
        "luxury": {
            title: "Waterfront Villa",
            desc: "5 Bed • 4 Bath • 5,400 sq ft",
            tagText: "Premium",
            tagClass: "tag-accent",
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 22h20"></path>
                        <path d="M3 17l4-4h10l4 4"></path>
                        <path d="M5 13V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8"></path>
                        <path d="M9 13v-3h6v3"></path>
                      </svg>`,
            bedrooms: 5,
            bathrooms: 4,
            floors: 2,
            sqft_living: 5400,
            sqft_lot: 18000,
            sqft_above: 4200,
            sqft_basement: 1200,
            waterfront: "Y",
            view: 4,
            condition: "Very Good",
            grade: 11,
            yr_built: 2008,
            yr_renovated: 2018,
            lat: 47.6101,
            long: -122.1201
        },
        "condo": {
            title: "Downtown Condo",
            desc: "2 Bed • 2 Bath • 1,150 sq ft",
            tagText: "Urban",
            tagClass: "tag-secondary",
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                        <line x1="9" y1="22" x2="9" y2="16"></line>
                        <line x1="15" y1="22" x2="15" y2="16"></line>
                        <line x1="9" y1="16" x2="15" y2="16"></line>
                        <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z"></path>
                      </svg>`,
            bedrooms: 2,
            bathrooms: 2,
            floors: 1,
            sqft_living: 1150,
            sqft_lot: 1000,
            sqft_above: 1150,
            sqft_basement: 0,
            waterfront: "N",
            view: 2,
            condition: "Good",
            grade: 9,
            yr_built: 2016,
            yr_renovated: 0,
            lat: 47.6062,
            long: -122.3321
        },
        "cottage": {
            title: "Woodland Cabin",
            desc: "2 Bed • 1 Bath • 980 sq ft",
            tagText: "Rustic",
            tagClass: "tag-warning",
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 12h3v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8h3L12 2z"></path>
                        <path d="M9 22V12h6v10"></path>
                      </svg>`,
            bedrooms: 2,
            bathrooms: 1,
            floors: 1,
            sqft_living: 980,
            sqft_lot: 35000,
            sqft_above: 980,
            sqft_basement: 0,
            waterfront: "N",
            view: 1,
            condition: "Very Good",
            grade: 6,
            yr_built: 1952,
            yr_renovated: 1998,
            lat: 47.2529,
            long: -122.4443
        },
        "townhouse": {
            title: "Urban Townhouse",
            desc: "3 Bed • 2 Bath • 1,850 sq ft",
            tagText: "Modern",
            tagClass: "tag-light",
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M5 21V7l7-4v18"></path>
                        <path d="M19 21V11l-7-4v14"></path>
                        <path d="M9 11h2v2H9v-2zm0 4h2v2H9v-2zm6-4h2v2h-2v-2zm0 4h2v2h-2v-2z"></path>
                      </svg>`,
            bedrooms: 3,
            bathrooms: 2,
            floors: 3,
            sqft_living: 1850,
            sqft_lot: 2200,
            sqft_above: 1550,
            sqft_basement: 300,
            waterfront: "N",
            view: 0,
            condition: "Good",
            grade: 8,
            yr_built: 2005,
            yr_renovated: 0,
            lat: 47.6769,
            long: -122.2060
        },
        "manor": {
            title: "Country Manor",
            desc: "4 Bed • 3 Bath • 3,600 sq ft",
            tagText: "Elite",
            tagClass: "tag-rose",
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22V12h10V9H2v3h10"></path>
                        <path d="M6 12v10h12V12"></path>
                        <path d="M12 2L4 9h16L12 2z"></path>
                      </svg>`,
            bedrooms: 4,
            bathrooms: 3,
            floors: 2,
            sqft_living: 3600,
            sqft_lot: 85000,
            sqft_above: 3000,
            sqft_basement: 600,
            waterfront: "N",
            view: 3,
            condition: "Good",
            grade: 10,
            yr_built: 1988,
            yr_renovated: 2012,
            lat: 47.5600,
            long: -122.2500
        }
    };

    
    document.querySelectorAll(".num-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const targetId = button.getAttribute("data-target");
            const step = parseFloat(button.getAttribute("data-step") || "1");
            const input = document.getElementById(targetId);
            const isIncrease = button.classList.contains("increase");
            
            let currentVal = parseFloat(input.value) || 0;
            let newVal = isIncrease ? currentVal + step : currentVal - step;
            
            
            const min = parseFloat(input.getAttribute("min"));
            const max = parseFloat(input.getAttribute("max"));
            
            if (!isNaN(min) && newVal < min) newVal = min;
            if (!isNaN(max) && newVal > max) newVal = max;
            
            
            input.value = step % 1 === 0 ? Math.round(newVal) : newVal.toFixed(2);
            
            
            input.dispatchEvent(new Event("input"));
        });
    });

    
    gradeSlider.addEventListener("input", (e) => {
        gradeBadge.textContent = e.target.value;
    });

    
    function applyHousePreset(presetKey) {
        const preset = HOUSE_PRESETS[presetKey];
        if (!preset) return;
        
        document.getElementById("input-bedrooms").value = preset.bedrooms;
        document.getElementById("input-bathrooms").value = preset.bathrooms;
        document.getElementById("input-floors").value = preset.floors;
        
        if (preset.waterfront === "Y") {
            document.getElementById("waterfront-yes").checked = true;
        } else {
            document.getElementById("waterfront-no").checked = true;
        }
        
        document.getElementById("input-view").value = preset.view;
        document.getElementById("input-condition").value = preset.condition;
        
        gradeSlider.value = preset.grade;
        gradeBadge.textContent = preset.grade;
        
        document.getElementById("input-sqft-living").value = preset.sqft_living;
        document.getElementById("input-sqft-lot").value = preset.sqft_lot;
        document.getElementById("input-sqft-above").value = preset.sqft_above;
        document.getElementById("input-sqft-basement").value = preset.sqft_basement;
        
        latInput.value = preset.lat.toFixed(4);
        longInput.value = preset.long.toFixed(4);
        
        document.getElementById("input-yr-built").value = preset.yr_built;
        document.getElementById("input-yr-renovated").value = preset.yr_renovated;
        
        form.style.borderColor = "var(--color-primary)";
        form.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.15)";
        setTimeout(() => {
            form.style.borderColor = "var(--border-color)";
            form.style.boxShadow = "var(--glow-shadow), var(--card-glow)";
        }, 800);
    }
    
    // Dynamically render preset cards from metadata
    const presetsContainer = document.getElementById("presets-container");
    
    function renderPresetCards() {
        if (!presetsContainer) return;
        presetsContainer.innerHTML = "";
        
        Object.entries(HOUSE_PRESETS).forEach(([key, preset], index) => {
            const card = document.createElement("div");
            card.className = `preset-card${index === 0 ? " active" : ""}`;
            card.setAttribute("data-preset", key);
            card.setAttribute("tabindex", "0");
            
            card.innerHTML = `
                <span class="preset-tag ${preset.tagClass}">${preset.tagText}</span>
                <div class="preset-icon">
                    ${preset.iconSvg}
                </div>
                <h4 class="preset-title">${preset.title}</h4>
                <p class="preset-desc">${preset.desc}</p>
            `;
            
            card.addEventListener("click", () => {
                document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
                card.classList.add("active");
                applyHousePreset(key);
            });
            
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    card.click();
                }
            });
            
            presetsContainer.appendChild(card);
        });
    }

    renderPresetCards();

    const formInputs = form.querySelectorAll("input, select");
    formInputs.forEach(input => {
        input.addEventListener("input", (e) => {
            if (e.isTrusted) {
                document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
            }
        });
        input.addEventListener("change", (e) => {
            if (e.isTrusted) {
                document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
            }
        });
    });

    
    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(val);
    };

    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        
        const waterfrontVal = document.querySelector('input[name="waterfront"]:checked').value;
        const selectedModel = document.getElementById("model-selector").value;
        const variantVal = document.getElementById("variant-selector").value;
        
        
        const payload = {
            variant: variantVal,
            bedrooms: parseInt(document.getElementById("input-bedrooms").value),
            bathrooms: parseFloat(document.getElementById("input-bathrooms").value),
            floors: parseFloat(document.getElementById("input-floors").value),
            waterfront: waterfrontVal,
            view: parseInt(document.getElementById("input-view").value),
            condition: document.getElementById("input-condition").value,
            grade: parseInt(gradeSlider.value),
            sqft_living: parseInt(document.getElementById("input-sqft-living").value),
            sqft_lot: parseInt(document.getElementById("input-sqft-lot").value),
            sqft_above: parseInt(document.getElementById("input-sqft-above").value),
            sqft_basement: parseInt(document.getElementById("input-sqft-basement").value),
            lat: parseFloat(latInput.value),
            long: parseFloat(longInput.value),
            yr_built: parseInt(document.getElementById("input-yr-built").value),
            yr_renovated: parseInt(document.getElementById("input-yr-renovated").value)
        };
        
        
        placeholderPanel.classList.add("hidden");
        contentPanel.classList.add("hidden");
        loadingPanel.classList.remove("hidden");
        
        try {
            const response = await fetch("/api/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                alert("Model prediction error: " + data.error);
                placeholderPanel.classList.remove("hidden");
                loadingPanel.classList.add("hidden");
                return;
            }
            
            
            const predictions = data.predictions;
            const derived = data.derived;
            
            
            const allModelPrices = Object.values(predictions);
            const ensembleAverage = allModelPrices.reduce((a, b) => a + b, 0) / allModelPrices.length;
            
            
            let displayPrice = 0;
            let displayName = "";
            
            if (selectedModel === "All Models") {
                displayPrice = ensembleAverage;
                displayName = "Ensemble Average";
                primaryModelLabel.textContent = "Average Predicted Valuation";
                primaryModelBadge.textContent = "6-Model Collective Average";
            } else if (predictions[selectedModel]) {
                displayPrice = predictions[selectedModel];
                displayName = selectedModel;
                primaryModelLabel.textContent = "Estimated Property Value";
                primaryModelBadge.textContent = selectedModel;
            } else {
                
                displayPrice = predictions["LightGBM"] || ensembleAverage;
                displayName = predictions["LightGBM"] ? "LightGBM" : "Ensemble Average";
                primaryModelLabel.textContent = "Estimated Property Value";
                primaryModelBadge.textContent = displayName;
            }
            
            
            primaryPriceVal.textContent = formatCurrency(displayPrice);
            variantBadge.textContent = variantVal === "1" ? "Enhanced Dataset Models (Variant 1)" : "Standard Dataset Models";
            variantBadge.style.borderColor = variantVal === "1" ? "var(--color-secondary)" : "var(--color-primary)";
            variantBadge.style.color = variantVal === "1" ? "var(--color-secondary)" : "var(--color-primary)";
            variantBadge.style.background = variantVal === "1" ? "rgba(139, 92, 246, 0.15)" : "rgba(59, 130, 246, 0.15)";
            
            
            const sqft = payload.sqft_living || 1;
            valPricePerSqft.textContent = formatCurrency(displayPrice / sqft) + "/sq ft";
            valAge.textContent = derived.age !== null ? `${derived.age} years` : "N/A";
            valRenov.textContent = derived.years_since_renovation !== null ? 
                (payload.yr_renovated > 0 ? `${derived.years_since_renovation} years ago` : "Never Renovated") : "N/A";
            valBathBed.textContent = derived.bath_per_bed !== null ? derived.bath_per_bed.toFixed(2) : "N/A";
            
            
            renderChart(predictions, displayName, selectedModel);
            
            
            populateDetailsTable(predictions, displayPrice, displayName);
            
            
            loadingPanel.classList.add("hidden");
            contentPanel.classList.remove("hidden");
            
            
            if (window.innerWidth <= 1024) {
                contentPanel.scrollIntoView({ behavior: "smooth" });
            }
            
        } catch (error) {
            console.error("Fetch error:", error);
            alert("An error occurred while communicating with the model server.");
            placeholderPanel.classList.remove("hidden");
            loadingPanel.classList.add("hidden");
        }
    });

    
    function renderChart(predictions, activeModelName, selectionMode) {
        const ctx = document.getElementById("predictionChart").getContext("2d");
        
        
        const sortedData = Object.entries(predictions).sort((a, b) => b[1] - a[1]);
        const labels = sortedData.map(item => item[0]);
        const prices = sortedData.map(item => item[1]);
        
        
        const backgroundColors = labels.map(label => {
            if (selectionMode === "All Models") {
                
                return "rgba(59, 130, 246, 0.6)"; 
            } else if (label === activeModelName) {
                
                return "rgba(139, 92, 246, 0.85)"; 
            }
            return "rgba(59, 130, 246, 0.3)";
        });

        const borderColors = labels.map(label => {
            if (selectionMode === "All Models") {
                return "rgba(59, 130, 246, 1)";
            } else if (label === activeModelName) {
                return "rgba(139, 92, 246, 1)";
            }
            return "rgba(255, 255, 255, 0.15)";
        });

        if (chartInstance) {
            chartInstance.destroy();
        }

        
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valuation Prediction',
                    data: prices,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1.5,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y', 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(9, 12, 21, 0.95)',
                        titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
                        bodyFont: { family: 'Inter', size: 12 },
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                return `Valuation: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'transparent'
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 10 },
                            callback: function(value) {
                                return '$' + (value / 1000) + 'k';
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#f8fafc',
                            font: { family: 'Outfit', size: 11, weight: '500' }
                        }
                    }
                }
            }
        });
    }

    
    function populateDetailsTable(predictions, referencePrice, referenceName) {
        detailsTableBody.innerHTML = "";
        
        
        const sortedModels = Object.entries(predictions).sort((a, b) => b[1] - a[1]);
        
        sortedModels.forEach(([name, price]) => {
            const tr = document.createElement("tr");
            
            
            const tdName = document.createElement("td");
            tdName.textContent = name;
            if (name === referenceName) {
                tdName.innerHTML = `<strong>${name}</strong> <span class="badge" style="margin-top: 0; padding: 0.1rem 0.4rem; font-size: 0.65rem;">Active</span>`;
            }
            
            
            const tdPrice = document.createElement("td");
            tdPrice.className = "text-right";
            tdPrice.textContent = formatCurrency(price);
            
            
            const tdDelta = document.createElement("td");
            tdDelta.className = "text-right";
            
            const deltaVal = price - referencePrice;
            const deltaPercent = (deltaVal / referencePrice) * 100;
            
            if (name === referenceName) {
                tdDelta.innerHTML = `<span class="delta-neutral">&mdash;</span>`;
            } else {
                const prefix = deltaVal >= 0 ? "+" : "";
                const className = deltaVal >= 0 ? "delta-positive" : "delta-negative";
                tdDelta.innerHTML = `<span class="${className}">${prefix}${formatCurrency(deltaVal)} (${prefix}${deltaPercent.toFixed(1)}%)</span>`;
            }
            
            tr.appendChild(tdName);
            tr.appendChild(tdPrice);
            tr.appendChild(tdDelta);
            
            detailsTableBody.appendChild(tr);
        });
    }
});
