export const RCTP = {
    route: {
        outbound: "DALOL V631 ENVAR M750 TONGA",
        inbound: " CHALI T3 MKG A1 ELATO V522 ABBEY",
    },
    radio: {
        outbound: {
            DEP: {
                GND: "121.875",
                GND2: "122.6",
                TWR: "118.4",
                DEP: "123.8",
                DEP2: "133.825"
            },
            DALOL: "HKG 118.925",
            ENVAR: "TPE 129.1",
            TONGA: "TPE 126.7",
        
            ARR: {
                APP: "125.1",
				TWR: "118.7",
                GND_W: "121.7",
                GND_E: "121.6"
            }
        },
        inbound: {
            DEP: {
                GND_E: "121.6",
                GND_W: "121.7",
                TWR: "118.7",
                DEP: "125.1",
                
            },
            AREA: "TPE 126.7",
            MKG: "TPE 129.1",
            ELATO: "HKG 121.3",
            MAGOG: "HKG RAD 126.5",
            ABBEY: "HKG ARR",
            ARR: {
                ARR: "119.1",
                DIR: "119.5",
                TWR: "118.7",
                GND: "122.6",
                GND2: "121.875",
            }
        }
    }
};