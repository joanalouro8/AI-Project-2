document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.getElementById("valuation-form");
    const btnSubmit = document.getElementById("btn-submit");
    const btnLoadExample = document.getElementById("btn-load-example");
    const gradeSlider = document.getElementById("input-grade");
    const gradeBadge = document.getElementById("grade-badge-val");
    const locationPreset = document.getElementById("preset-location");
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

    
    const COORDINATE_PRESETS = {
        "seattle_dt": { lat: 47.6062, long: -122.3321 },
        "bellevue": { lat: 47.6101, long: -122.1201 },
        "redmond": { lat: 47.6740, long: -122.1215 },
        "kirkland": { lat: 47.6769, long: -122.2060 },
        "tacoma": { lat: 47.2529, long: -122.4443 }
    };

    
    const SAMPLE_HOUSE = {
        bedrooms: 4,
        bathrooms: 3,
        floors: 2,
        sqft_living: 2800,
        sqft_lot: 9000,
        sqft_above: 2200,
        sqft_basement: 600,
        waterfront: "N",
        view: "1",
        condition: "Average",
        grade: 9,
        yr_built: 1990,
        yr_renovated: 0,
        lat: 47.5085,
        long: -122.2440
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

    
    locationPreset.addEventListener("change", (e) => {
        const presetKey = e.target.value;
        if (presetKey && COORDINATE_PRESETS[presetKey]) {
            const coords = COORDINATE_PRESETS[presetKey];
            latInput.value = coords.lat.toFixed(4);
            longInput.value = coords.long.toFixed(4);
        }
    });

    
    [latInput, longInput].forEach(elem => {
        elem.addEventListener("input", () => {
            locationPreset.value = "custom";
        });
    });

    
    btnLoadExample.addEventListener("click", () => {
        
        document.getElementById("input-bedrooms").value = SAMPLE_HOUSE.bedrooms;
        document.getElementById("input-bathrooms").value = SAMPLE_HOUSE.bathrooms.toFixed(2);
        document.getElementById("input-floors").value = SAMPLE_HOUSE.floors.toFixed(1);
        
        if (SAMPLE_HOUSE.waterfront === "Y") {
            document.getElementById("waterfront-yes").checked = true;
        } else {
            document.getElementById("waterfront-no").checked = true;
        }
        
        document.getElementById("input-view").value = SAMPLE_HOUSE.view;
        document.getElementById("input-condition").value = SAMPLE_HOUSE.condition;
        
        gradeSlider.value = SAMPLE_HOUSE.grade;
        gradeBadge.textContent = SAMPLE_HOUSE.grade;
        
        document.getElementById("input-sqft-living").value = SAMPLE_HOUSE.sqft_living;
        document.getElementById("input-sqft-lot").value = SAMPLE_HOUSE.sqft_lot;
        document.getElementById("input-sqft-above").value = SAMPLE_HOUSE.sqft_above;
        document.getElementById("input-sqft-basement").value = SAMPLE_HOUSE.sqft_basement;
        
        locationPreset.value = "custom";
        latInput.value = SAMPLE_HOUSE.lat.toFixed(4);
        longInput.value = SAMPLE_HOUSE.long.toFixed(4);
        
        document.getElementById("input-yr-built").value = SAMPLE_HOUSE.yr_built;
        document.getElementById("input-yr-renovated").value = SAMPLE_HOUSE.yr_renovated;
        
        
        form.style.borderColor = "var(--color-primary)";
        setTimeout(() => {
            form.style.borderColor = "var(--border-color)";
        }, 1000);
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
