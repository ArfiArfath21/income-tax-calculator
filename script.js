document.addEventListener('DOMContentLoaded', function() {
    // Form Elements
    const taxCalculatorForm = document.getElementById('tax-calculator-form');
    const calculateBtn = document.getElementById('calculate-btn');
    const recalculateBtn = document.getElementById('recalculate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resultSection = document.getElementById('result-section');
    
    // 80C calculation
    const epfContribution = document.getElementById('epf-contribution');
    const elssInvestment = document.getElementById('elss-investment');
    const lifeInsurance = document.getElementById('life-insurance');
    const homeLoanPrincipal = document.getElementById('home-loan-principal');
    const other80c = document.getElementById('other-80c');
    const total80c = document.getElementById('total-80c');
    
    // Joint home loan toggle
    const jointHomeLoan = document.getElementById('joint-home-loan');
    const loanShareGroup = document.getElementById('loan-share-group');
    
    // Initialize accordion functionality
    initAccordion();
    
    // Initialize tooltips
    initTooltips();
    
    // Calculate total 80C on input change
    const section80cInputs = [epfContribution, elssInvestment, lifeInsurance, homeLoanPrincipal, other80c];
    
    section80cInputs.forEach(input => {
        input.addEventListener('input', calculateTotal80C);
    });
    
    // Toggle loan share input based on joint home loan selection
    jointHomeLoan.addEventListener('change', function() {
        loanShareGroup.style.display = this.value === 'yes' ? 'block' : 'none';
    });
    
    // Form submission
    taxCalculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateTax();
    });
    
    // Recalculate button
    recalculateBtn.addEventListener('click', function() {
        resultSection.style.display = 'none';
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Download summary button
    downloadBtn.addEventListener('click', generatePDF);
    
    // Calculate total 80C deduction
    function calculateTotal80C() {
        const epfValue = parseFloat(epfContribution.value) || 0;
        const elssValue = parseFloat(elssInvestment.value) || 0;
        const lifeInsuranceValue = parseFloat(lifeInsurance.value) || 0;
        const homeLoanPrincipalValue = parseFloat(homeLoanPrincipal.value) || 0;
        const other80cValue = parseFloat(other80c.value) || 0;
        
        let totalValue = epfValue + elssValue + lifeInsuranceValue + homeLoanPrincipalValue + other80cValue;
        
        // Cap at 1.5 lakh
        if (totalValue > 150000) {
            totalValue = 150000;
        }
        
        total80c.textContent = '₹' + formatNumberWithCommas(totalValue);
        
        // Add warning if over limit
        if (epfValue + elssValue + lifeInsuranceValue + homeLoanPrincipalValue + other80cValue > 150000) {
            total80c.innerHTML += ' <span style="color: var(--red-color); font-size: 0.8rem;">(Max limit reached)</span>';
        }
    }
    
    // Calculate tax for both regimes
    function calculateTax() {
        // Get form values
        const annualSalary = parseFloat(document.getElementById('annual-salary').value) || 0;
        const basicSalary = parseFloat(document.getElementById('basic-salary').value) || (annualSalary * 0.5); // Default to 50% if not provided
        const hraReceived = parseFloat(document.getElementById('hra-received').value) || (basicSalary * 0.5); // Default to 50% of basic if not provided
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        
        // Rent details
        const monthlyRent = parseFloat(document.getElementById('rent-paid').value) || 0;
        const annualRent = monthlyRent * 12;
        const isMetroCity = document.getElementById('metro-city').value === 'yes';
        
        // Section 80C
        const epfValue = parseFloat(epfContribution.value) || 0;
        const elssValue = parseFloat(elssInvestment.value) || 0;
        const lifeInsuranceValue = parseFloat(lifeInsurance.value) || 0;
        const homeLoanPrincipalValue = parseFloat(homeLoanPrincipal.value) || 0;
        const other80cValue = parseFloat(other80c.value) || 0;
        const total80cValue = Math.min(epfValue + elssValue + lifeInsuranceValue + homeLoanPrincipalValue + other80cValue, 150000);
        
        // Section 80D (Health Insurance)
        const selfHealthInsurance = parseFloat(document.getElementById('self-health-insurance').value) || 0;
        const parentsHealthInsurance = parseFloat(document.getElementById('parents-health-insurance').value) || 0;
        const isParentsSenior = document.getElementById('parents-senior').value === 'yes';
        
        // Calculate 80D deduction
        const selfHealthLimit = 25000;
        const parentsHealthLimit = isParentsSenior ? 50000 : 25000;
        const total80dValue = Math.min(selfHealthInsurance, selfHealthLimit) + Math.min(parentsHealthInsurance, parentsHealthLimit);
        
        // Home Loan Interest
        const homeLoanInterest = parseFloat(document.getElementById('home-loan-interest').value) || 0;
        const isJointLoan = document.getElementById('joint-home-loan').value === 'yes';
        const loanShare = isJointLoan ? (parseFloat(document.getElementById('loan-share').value) || 50) / 100 : 1;
        const homeLoanInterestDeduction = Math.min(homeLoanInterest * loanShare, 200000);
        
        // Other Deductions
        const npsContribution = parseFloat(document.getElementById('nps-contribution').value) || 0;
        const savingsInterest = parseFloat(document.getElementById('savings-interest').value) || 0;
        const educationLoanInterest = parseFloat(document.getElementById('education-loan-interest').value) || 0;
        const donations = parseFloat(document.getElementById('donations').value) || 0;
        
        // Calculate NPS deduction (80CCD(1B) - additional ₹50,000)
        const npsDeduction = Math.min(npsContribution, 50000);
        
        // Calculate savings interest deduction (80TTA - up to ₹10,000)
        const savingsInterestDeduction = Math.min(savingsInterest, 10000);
        
        // Calculate total other deductions
        const totalOtherDeductions = npsDeduction + savingsInterestDeduction + educationLoanInterest + donations;
        
        // Calculate HRA exemption
        const hraExemption = calculateHraExemption(hraReceived, basicSalary, annualRent, isMetroCity);
        
        // Calculate gross total income
        const grossTotalIncome = annualSalary + otherIncome;
        
        // Calculate taxable income under old regime
        const taxableIncomeOld = Math.max(0, grossTotalIncome - hraExemption - total80cValue - total80dValue - homeLoanInterestDeduction - totalOtherDeductions);
        
        // Calculate tax under old regime
        const incomeTaxOld = calculateOldRegimeTax(taxableIncomeOld);
        const cessOld = incomeTaxOld * 0.04; // 4% education and health cess
        const totalTaxOld = incomeTaxOld + cessOld;
        
        // Calculate taxable income under new regime
        const standardDeduction = 75000; // Standard deduction for salaried individuals
        const taxableIncomeNew = Math.max(0, grossTotalIncome - standardDeduction);
        
        // Calculate tax under new regime
        const incomeTaxNew = calculateNewRegimeTax(taxableIncomeNew);
        const cessNew = incomeTaxNew * 0.04; // 4% education and health cess
        const totalTaxNew = incomeTaxNew + cessNew;
        
        // Determine which regime is better
        const taxDifference = Math.abs(totalTaxOld - totalTaxNew);
        const betterRegime = totalTaxOld <= totalTaxNew ? 'Old' : 'New';
        
        // Update the results
        updateResults(
            grossTotalIncome,
            hraExemption,
            total80cValue,
            total80dValue,
            homeLoanInterestDeduction,
            totalOtherDeductions,
            taxableIncomeOld,
            incomeTaxOld,
            cessOld,
            totalTaxOld,
            taxableIncomeNew,
            incomeTaxNew,
            cessNew,
            totalTaxNew,
            betterRegime,
            taxDifference
        );
        
        // Generate optimization tips
        generateOptimizationTips(
            basicSalary,
            total80cValue,
            selfHealthInsurance,
            parentsHealthInsurance,
            homeLoanInterest,
            npsContribution,
            betterRegime,
            taxableIncomeOld,
            taxableIncomeNew,
            annualRent,
            hraReceived
        );
        
        // Draw comparison chart
        drawComparisonChart(totalTaxOld, totalTaxNew);
        
        // Show results section
        resultSection.style.display = 'block';
        
        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Calculate HRA exemption
    function calculateHraExemption(hraReceived, basicSalary, annualRent, isMetroCity) {
        if (annualRent === 0) {
            return 0; // No rent paid, no exemption
        }
        
        const basicPercent = isMetroCity ? 0.5 : 0.4; // 50% for metro, 40% for non-metro
        const rentMinusBasicPercent = annualRent - (basicSalary * 0.1); // Rent - 10% of basic
        
        // HRA exemption is least of the three
        return Math.min(
            hraReceived,
            basicSalary * basicPercent,
            Math.max(0, rentMinusBasicPercent)
        );
    }
    
    // Calculate tax under old regime
    function calculateOldRegimeTax(income) {
        let tax = 0;
        
        if (income <= 250000) {
            return 0;
        }
        
        // Apply rebate under section 87A if income is up to ₹5 lakh
        if (income <= 500000) {
            tax = (income - 250000) * 0.05;
            tax = Math.max(0, tax - 12500); // Rebate of up to ₹12,500
            return tax;
        }
        
        if (income > 1000000) {
            tax += (income - 1000000) * 0.3;
            income = 1000000;
        }
        
        if (income > 500000) {
            tax += (income - 500000) * 0.2;
            income = 500000;
        }
        
        if (income > 250000) {
            tax += (income - 250000) * 0.05;
        }
        
        return tax;
    }
    
    // Calculate tax under new regime
    function calculateNewRegimeTax(income) {
        let tax = 0;
        
        if (income <= 400000) {
            return 0;
        }
        
        // Apply rebate under section 87A if income is up to ₹12.75 lakh for salaried individuals
        if (income <= 1275000) {
            tax = calculateNewRegimeTaxWithoutRebate(income);
            return 0; // Full rebate for income up to ₹12.75 lakh
        }
        
        return calculateNewRegimeTaxWithoutRebate(income);
    }
    
    function calculateNewRegimeTaxWithoutRebate(income) {
        let tax = 0;
        
        if (income > 2400000) {
            tax += (income - 2400000) * 0.3;
            income = 2400000;
        }
        
        if (income > 2000000) {
            tax += (income - 2000000) * 0.25;
            income = 2000000;
        }
        
        if (income > 1600000) {
            tax += (income - 1600000) * 0.2;
            income = 1600000;
        }
        
        if (income > 1200000) {
            tax += (income - 1200000) * 0.15;
            income = 1200000;
        }
        
        if (income > 800000) {
            tax += (income - 800000) * 0.1;
            income = 800000;
        }
        
        if (income > 400000) {
            tax += (income - 400000) * 0.05;
        }
        
        return tax;
    }
    
    // Update results in the UI
    function updateResults(
        grossTotalIncome,
        hraExemption,
        total80cValue,
        total80dValue,
        homeLoanInterestDeduction,
        totalOtherDeductions,
        taxableIncomeOld,
        incomeTaxOld,
        cessOld,
        totalTaxOld,
        taxableIncomeNew,
        incomeTaxNew,
        cessNew,
        totalTaxNew,
        betterRegime,
        taxDifference
    ) {
        // Update old regime results
        document.getElementById('old-gross-income').textContent = '₹' + formatNumberWithCommas(grossTotalIncome);
        document.getElementById('old-hra-exemption').textContent = '₹' + formatNumberWithCommas(hraExemption);
        document.getElementById('old-80c-deduction').textContent = '₹' + formatNumberWithCommas(total80cValue);
        document.getElementById('old-80d-deduction').textContent = '₹' + formatNumberWithCommas(total80dValue);
        document.getElementById('old-home-loan-interest').textContent = '₹' + formatNumberWithCommas(homeLoanInterestDeduction);
        document.getElementById('old-other-deductions').textContent = '₹' + formatNumberWithCommas(totalOtherDeductions);
        document.getElementById('old-taxable-income').textContent = '₹' + formatNumberWithCommas(taxableIncomeOld);
        document.getElementById('old-income-tax').textContent = '₹' + formatNumberWithCommas(incomeTaxOld);
        document.getElementById('old-cess').textContent = '₹' + formatNumberWithCommas(cessOld);
        document.getElementById('old-total-tax').textContent = '₹' + formatNumberWithCommas(totalTaxOld);
        
        // Update new regime results
        document.getElementById('new-gross-income').textContent = '₹' + formatNumberWithCommas(grossTotalIncome);
        document.getElementById('new-taxable-income').textContent = '₹' + formatNumberWithCommas(taxableIncomeNew);
        document.getElementById('new-income-tax').textContent = '₹' + formatNumberWithCommas(incomeTaxNew);
        document.getElementById('new-cess').textContent = '₹' + formatNumberWithCommas(cessNew);
        document.getElementById('new-total-tax').textContent = '₹' + formatNumberWithCommas(totalTaxNew);
        
        // Update comparison result
        document.getElementById('better-regime').textContent = betterRegime;
        document.getElementById('tax-saving').textContent = '₹' + formatNumberWithCommas(taxDifference);
        
        // Highlight the better regime
        const oldRegimeResult = document.querySelector('.regime-result.old');
        const newRegimeResult = document.querySelector('.regime-result.new');
        
        if (betterRegime === 'Old') {
            oldRegimeResult.style.boxShadow = '0 0 15px rgba(50, 210, 150, 0.5)';
            newRegimeResult.style.boxShadow = 'none';
        } else {
            newRegimeResult.style.boxShadow = '0 0 15px rgba(50, 210, 150, 0.5)';
            oldRegimeResult.style.boxShadow = 'none';
        }
    }
    
    // Generate optimization tips
    function generateOptimizationTips(
        basicSalary,
        total80cValue,
        selfHealthInsurance,
        parentsHealthInsurance,
        homeLoanInterest,
        npsContribution,
        betterRegime,
        taxableIncomeOld,
        taxableIncomeNew,
        annualRent,
        hraReceived
    ) {
        const tipsList = document.getElementById('optimization-tips');
        tipsList.innerHTML = ''; // Clear existing tips
        
        // Tips for Old Regime optimization
        if (betterRegime === 'Old' || taxableIncomeOld - taxableIncomeNew < 200000) {
            // 80C optimization
            if (total80cValue < 150000) {
                const remaining80C = 150000 - total80cValue;
                addTip(`You can invest an additional ₹${formatNumberWithCommas(remaining80C)} under Section 80C to maximize your tax savings. Consider ELSS, PPF, or 5-year tax-saving FDs.`);
            }
            
            // Health insurance optimization
            if (selfHealthInsurance < 25000) {
                addTip(`Consider getting or increasing your health insurance coverage. You can claim up to ₹25,000 for self and family under Section 80D.`);
            }
            
            // NPS optimization
            if (npsContribution < 50000) {
                addTip(`Invest in National Pension System (NPS) to get additional deduction of up to ₹50,000 under Section 80CCD(1B), over and above the 80C limit.`);
            }
            
            // HRA optimization
            if (annualRent > 0 && annualRent < (basicSalary * 0.12)) {
                addTip(`Your rent is less than 12% of your basic salary. For optimal HRA exemption, consider paying rent that is at least 12-15% of your basic salary.`);
            }
            
            // Home loan interest tip
            if (homeLoanInterest > 0 && homeLoanInterest < 200000) {
                addTip(`You're utilizing Section 24B for home loan interest but haven't reached the ₹2 lakh limit. If possible, consider restructuring your loan for optimal tax benefits.`);
            }
        }
        
        // Tips for New Regime optimization or general tips
        if (taxableIncomeNew > 1275000 && taxableIncomeNew < 1400000) {
            addTip(`Your income is slightly above ₹12.75 lakh under the New Regime. Consider making tax-saving investments to bring it down below this threshold to avail the rebate.`);
        }
        
        // General tip for those with high income
        if (taxableIncomeOld > 1500000 && total80cValue + selfHealthInsurance + parentsHealthInsurance + homeLoanInterest + npsContribution < 300000) {
            addTip(`With your income level, maximizing all available deductions under the Old Regime could significantly reduce your tax liability.`);
        }
        
        // If no specific tips, add general advice
        if (tipsList.children.length === 0) {
            if (betterRegime === 'Old') {
                addTip(`Continue maximizing your deductions under the Old Regime to maintain your tax advantages.`);
            } else {
                addTip(`The New Regime is currently better for you. If your investment pattern changes significantly, recalculate to check which regime works better.`);
            }
        }
        
        function addTip(text) {
            const li = document.createElement('li');
            li.textContent = text;
            tipsList.appendChild(li);
        }
    }
    
    // Draw comparison chart
    function drawComparisonChart(oldTax, newTax) {
        const container = document.getElementById('regime-comparison-chart');
        container.innerHTML = ''; // Clear previous chart
        
        const maxTax = Math.max(oldTax, newTax);
        const chartHeight = 220;
        
        const oldBarHeight = (oldTax / maxTax) * chartHeight;
        const newBarHeight = (newTax / maxTax) * chartHeight;
        
        // Create chart HTML
        const chartHTML = `
            <div class="chart">
                <div class="chart-bars">
                    <div class="bar-container">
                        <div class="bar old-bar" style="height: ${oldBarHeight}px;"></div>
                        <div class="tax-amount">₹${formatNumberWithCommas(oldTax)}</div>
                        <div class="bar-label">Old Regime</div>
                    </div>
                    <div class="bar-container">
                        <div class="bar new-bar" style="height: ${newBarHeight}px;"></div>
                        <div class="tax-amount">₹${formatNumberWithCommas(newTax)}</div>
                        <div class="bar-label">New Regime</div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = chartHTML;
        
        // Add CSS for the chart
        const style = document.createElement('style');
        style.textContent = `
            .chart {
                width: 100%;
                height: 280px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .chart-bars {
                display: flex;
                justify-content: center;
                align-items: flex-end;
                height: 240px;
                width: 100%;
                gap: 60px;
                margin-top: 20px;
            }
            
            .bar-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 120px;
            }
            
            .bar {
                width: 100%;
                border-radius: 8px 8px 0 0;
                transition: height 1s ease-out;
            }
            
            .old-bar {
                background-color: var(--primary-color);
            }
            
            .new-bar {
                background-color: var(--secondary-color);
            }
            
            .tax-amount {
                margin-top: 10px;
                font-weight: 600;
            }
            
            .bar-label {
                margin-top: 5px;
                color: var(--gray-dark);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Initialize accordion functionality
    function initAccordion() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('.accordion-icon');
                
                // Toggle active class
                content.classList.toggle('active');
                
                // Change the icon
                if (content.classList.contains('active')) {
                    icon.textContent = '-';
                } else {
                    icon.textContent = '+';
                }
                
                // Close other accordions
                accordionHeaders.forEach(otherHeader => {
                    if (otherHeader !== this) {
                        const otherContent = otherHeader.nextElementSibling;
                        const otherIcon = otherHeader.querySelector('.accordion-icon');
                        
                        otherContent.classList.remove('active');
                        otherIcon.textContent = '+';
                    }
                });
            });
        });
    }
    
    // Initialize tooltips
    function initTooltips() {
        // Add mobile-friendly tooltip behavior
        const tooltipIcons = document.querySelectorAll('.tooltip-icon');
        
        tooltipIcons.forEach(icon => {
            // For mobile: make it toggleable
            icon.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent click from bubbling to document
                
                const tooltipContent = this.nextElementSibling;
                
                // Close all other open tooltips
                document.querySelectorAll('.tooltip-content').forEach(tooltip => {
                    if (tooltip !== tooltipContent && tooltip.classList.contains('active')) {
                        tooltip.classList.remove('active');
                    }
                });
                
                // Toggle current tooltip
                tooltipContent.classList.toggle('active');
            });
        });
        
        // Add style for mobile tooltips
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .tooltip-content {
                    visibility: hidden;
                    opacity: 0;
                    transition: opacity 0.3s, visibility 0.3s;
                    pointer-events: auto;
                }
                
                .tooltip-content.active {
                    visibility: visible;
                    opacity: 1;
                }
                
                .tooltip-container:hover .tooltip-content {
                    visibility: hidden;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Close tooltips when clicking elsewhere
        document.addEventListener('click', function() {
            document.querySelectorAll('.tooltip-content.active').forEach(tooltip => {
                tooltip.classList.remove('active');
            });
        });
    }
    
    // Format number with commas
    function formatNumberWithCommas(number) {
        return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Generate PDF summary
    function generatePDF() {
        alert('This feature would generate a PDF summary of your tax calculation. In a real implementation, this would use a library like jsPDF to create a downloadable PDF document.');
    }
});
