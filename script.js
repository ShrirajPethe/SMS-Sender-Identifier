// $(document).ready(function() {
$(document).ready(async function() {
    let senderData = [];

    try {
        const response = await fetch("data/sender_data.csv");
        if (!response.ok) {
            // throw new Error("Network response was not ok"); 
            throw new ("Network response was not ok"); 
        }
        const data = await response.text();
        senderData = $.csv.toObjects(data);
    } catch (error) {
        console.error("Error Loading Principal Entity Data !! :", error);
        displayMessage("Error Loading Principal Entity Data. Please try again later.", "ERROR");
    }

    // $.ajax({
    //     url: "data/sender_data.csv",
    //     dataType: "text",
    //     success: function(data) {
    //         senderData = $.csv.toObjects(data); 
    //         // FOR LATER IN case its Tsv  Have to ADD /t as a separator/delimitr           // senderData = $.csv.toObjects(data, { separator: '\t' }); 
    //     },
    //     : function() {
    //         console.(" Loading Principal Entity Data !! :", );
    //     }
    // });


    $('#searchBtn').click(function() {
        //    $('#searchBtn').click(function(event) {
        // // Prevent form submission
        // event.preventDefault();

        const rawInput = $('#senderId').val().trim().toUpperCase();
        const searchTerm = normalizeInput(rawInput);

        if (!searchTerm) {
            displayMessage("Please enter a valid Sender ID.", "ERROR");
            return;
        }
        // if (searchTerm.length < 6 || searchTerm.length > 11) {
        if ( searchTerm.length > 11) {
            displayMessage(`The Sender ID must be below  11 characters long. You entered ${searchTerm.length} characters.`, "ERROR");
            return;
        }


        if (searchTerm.length<3) { // && searchTerm.length>1
            $('#result').html('<div class="text-info">Searching...</div>');

            displayMessage(`Please enter the full Sender ID. You have only entered ${searchTerm.length} characters.`, "WARNING");
            // displayMessage("Please enter full Sender ID.\nYou have Only Entereneted "+ searchTerm.length +" Characters.","WARNING");
            // return;
            displaySearchResults([], [], [], searchTerm);
        } else {
            $('#result').html('<div class="text-info">Searching...</div>');

            // const results = searchSenderData(senderData, searchTerm);
            // displaySearchResults(results , searchTerm); // WRONG results
            const { exactMatches, startsWithMatches, partialMatches } = searchSenderData(senderData, searchTerm);
            displaySearchResults(exactMatches, startsWithMatches, partialMatches, searchTerm);
        }
    });

    function normalizeInput(input) {
        return input.replace(/[\s-]/g, '');
    }
    
    function searchSenderData(data, term) {
        let exactMatches = [];
        let startsWithMatches = [];
        let partialMatches = [];
        
        // if term.slice(2)

        data.forEach(item => {
            const header = normalizeInput(item.Header);
            const searchTerm = term.slice(2);
            
            if (header === searchTerm) {
                exactMatches.push(item);
            } else if (header.startsWith(searchTerm) && header.length > searchTerm.length ) {
            // } else if (header.startsWith(searchTerm) && header.length > searchTerm.length + 1) {
                startsWithMatches.push(item);
            } else if (header.includes(searchTerm)) {
                partialMatches.push(item);
            }

            // const header = normalizeInput(item.Header);
            // if (header.startsWith(term.slice(2))) {
            //     exactMatches.push(item);
            // } else if (header.includes(term.slice(2))) {
            //     partialMatches.push(item);
            // }
        });

        return { exactMatches, startsWithMatches, partialMatches };
    }

    function displaySearchResults(exactMatches, startsWithMatches, partialMatches, searchTerm) {
        let prefix = searchTerm.substring(0, 2);
        let tsp = getTSPFromPrefix(prefix[0]);
        let lsa = getLSAFromPrefix(prefix[1]);

        let html = '';
        // <p class="text-muted small">This result matches the exact starting letters of your search and includes information about the TSP and LSA.</p>
        if (exactMatches.length > 0) {
            // if (searchTerm)
            html += `<div class="alert alert-success">Found ${exactMatches.length} exact matching results</div>`;
            html += '<ul class="list-group">';
            exactMatches.forEach(result => {
                html += `
                    <li class="list-group-item">
                        <h5>${result['Principal Entity Name']}</h5>
                        <p><strong>Header:</strong> ${result.Header}</p>
                        <p><strong>TSP (Operator):</strong> ${tsp}</p>
                        <p><strong>LSA (Service Area):</strong> ${lsa}</p>
                        <p class="text-muted small">This result matches exactly with your search term.</p>
                    </li>
                `;
            });
            // html += '</ul>';
            html += '</ul class="mb-4">';
        }

        if (startsWithMatches.length > 0) { //mt-4
            html += `<div class="alert alert-info">Found ${startsWithMatches.length} matching results that start with your search term</div>`;
            html += '<ul class="list-group">';
            startsWithMatches.forEach(result => {
                html += `
                    <li class="list-group-item list-group-item-info">
                        <h5>${result['Principal Entity Name']}</h5>
                        <p><strong>Header:</strong> ${result.Header}</p>
                        <p><strong>TSP (Operator):</strong> ${tsp}</p>
                        <p><strong>LSA (Service Area):</strong> ${lsa}</p>
                        <p class="text-muted small">This result starts with your search term and is considered a strong match.</p>
                    </li>
                `;
            });
            html += '</ul class="mb-4">';
        }
//mt-4
        if (partialMatches.length > 0) {
            html += `<div class="alert alert-warning ">Found ${partialMatches.length} partially matching results</div>`;
            html += '<ul class="list-group">';
            partialMatches.forEach(result => {
                html += `
                    <li class="list-group-item list-group-item-secondary">
                        <h5>${result['Principal Entity Name']}</h5>
                        <p><strong>Header:</strong> ${result.Header}</p>
                        <p><strong>TSP (Operator):</strong> ${tsp}</p>
                        <p><strong>LSA (Service Area):</strong> ${lsa}</p>
                        <p class="text-muted small">This result partially matches your search term.</p>
                    </li>
                `;
            });
            html += '</ul>';
        }

        if (exactMatches.length === 0 && partialMatches.length === 0 && startsWithMatches.length === 0 && (tsp!="Unknown Telecom Service Providers / Originating Access Providers" || lsa!="Unknown License Service Area")) {
            if ((searchTerm.length <= 2)) {
                html += `<div class="alert alert-warning ">Found No matching results. You have Entered only the First 2 Letters.</div>`;
            } else {
                html += `<div class="alert alert-warning ">Found No matching results.</div>`;
            }
            //       mt-4
            // html += `<div class="alert alert-warning ">Found No matching results. You have Entered only the First 2 Letters.</div>`;
            html += '<ul class="list-group">';
            html += `
                <li class="list-group-item list-group-item-secondary">
                    <p><strong>TSP (Operator):</strong> ${tsp}</p>
                    <p><strong>LSA (Service Area):</strong> ${lsa}</p>
                </li>
            `;
        }

        if (html === '') {
            displayMessage("No matching senders found.", "ERROR");
        } else {
            $('#result').html(html);
        }
    }

    // function searchSenderData(data, term) {
    //     // TODO: MORE  efficient 
    //     return data.filter(item => 
    //         normalizeInput(item.Header).includes(term.slice(2))
    //         // ||            // item['Principal Entity Name'].toUpperCase().includes(term)
    //     );
    // }

    // function displaySearchResults(results , searchTerm) {
    //     // let prefix = searchTerm.substring(0, 2);
    //     // let tsp = getTSPFromPrefix(prefix[0]);
    //     // let lsa = getLSAFromPrefix(prefix[1]);
    //     // let html = '<ul class="search-results">';
    //     // html += `
    //     //     <li class="search-results__item">
    //     //         <p><strong>Header:</strong> ${results.Header}</p>
    //     //         <p><strong>Principal Entity:</strong> ${results['Principal Entity Name']}</p>
    //     //         <p><strong>TSP (Operator):</strong> ${tsp}</p>
    //     //         <p><strong>LSA (Service Area):</strong> ${lsa}</p>
    //     //     </li>
    //     // `;       
    //     // html += '</ul>';
    //     // $('#result').html(html);
    //     // $('#result').html(html);

    //     if (results.length > 0) {
    //         // let prefix = searchTerm;
    //         let prefix = searchTerm.substring(0, 2);
    //         let tsp = getTSPFromPrefix(prefix[0]);
    //         let lsa = getLSAFromPrefix(prefix[1]);

    //         let html = `<div class="alert alert-success">Found ${results.length} matching results</div>`;
    //         html += '<ul class="list-group">';
    //         results.forEach(result => {
    //             html += `
    //                 <li class="list-group-item">
    //                     <h5>${result['Principal Entity Name']}</h5>
    //                     <p><strong>Header:</strong> ${result.Header}</p>
    //                     <p><strong>TSP (Operator):</strong> ${tsp}</p>
    //                     <p><strong>LSA (Service Area):</strong> ${lsa}</p>
    //                 </li>
    //             `;
    //         });
    //         html += '</ul>';
    //         $('#result').html(html);
    //     } else {
    //         displayMessage("No matching senders found.");
    //     }
    // }

    
    function getTSPFromPrefix(prefix) {
        // switch (prefix[0]) {
        switch (prefix) {
            case 'D': return 'Aircel Ltd/ Dishnet Wireless Ltd';
            case 'A': return 'Bharti Airtel Ltd/ Bharti Hexacom Ltd';
            case 'B': return 'Bharat Sanchar Nigam Ltd';
            case 'Q': return 'Quadrant Televentures Limited';
            case 'M': return 'Mahanagar Telephone Nigam Ltd';
            case 'R': return 'Reliance Communications Ltd';
            case 'J': return 'Reliance Jio Infocomm Ltd';
            case 'E': return 'Reliance Telecom Ltd';
            case 'T': return 'Tata Teleservices Ltd/ Tata Teleservices (Mah) Ltd';
            case 'V': return 'Vodafone Idea Ltd.';
            case 'C': return 'V-CON Mobile & Infra Private Ltd.';
            default: return 'Unknown Telecom Service Providers / Originating Access Providers';
        }
    }

    function getLSAFromPrefix(prefix) {
        // switch (prefix[1]) {
        switch (prefix) {
            case 'A': return 'Andhra Pradesh';
            case 'S': return 'Assam';
            case 'B': return 'Bihar';
            case 'D': return 'Delhi';
            case 'G': return 'Gujarat';
            case 'H': return 'Haryana';
            case 'I': return 'Himachal Pradesh';
            case 'J': return 'Jammu & Kashmir';
            case 'X': return 'Karnataka';
            case 'L': return 'Kerala';
            case 'K': return 'Kolkata';
            case 'Y': return 'Madhya Pradesh';
            case 'Z': return 'Maharashtra';
            case 'M': return 'Mumbai';
            case 'N': return 'North East';
            case 'O': return 'Orissa';
            case 'P': return 'Punjab';
            case 'R': return 'Rajasthan';
            case 'T': return 'Tamil Nadu including Chennai';
            case 'E': return 'UP-East';
            case 'W': return 'UP-West';
            case 'V': return 'West Bengal';
            default: return 'Unknown License Service Area';
        }
    }

    function displayMessage(message, type) {
        let alertClass;
    
        switch (type) {
            case 'ERROR':
                alertClass = 'alert-danger';
                message +=`<br>
                <a href="https://smsheader.trai.gov.in/query_header" target="_blank" class="btn btn-primary mt-3">
                    Click here to check on TRAI's website <i class="bi bi-box-arrow-up-right"></i>
                </a>`;
                break;
            case 'WARNING':
                alertClass = 'alert-warning';
                break;
            case 'INFO':
                alertClass = 'alert-info';
                break;
            case 'SUCCESS':
                alertClass = 'alert-success';
                break;
            case 'TEXT':
                alertClass = 'alert-secondary';
                break;
            default:
                alertClass = 'alert-primary'; 
        }
    
        $('#result').html(`<div class="alert ${alertClass}">${message}</div>`);
            
        // $('#result').html(`<div class="alert alert-danger">${message}</div>`);
    }
});