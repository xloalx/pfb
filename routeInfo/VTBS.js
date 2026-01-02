export const VTBS = {
    route: {
        outbound: "PECAN V10 SIKOU A202 RAMEI W42 PAKRI Y13 RUSKA DCT EASTE",
        inbound: " SELKA A1 SANOT Y15 GUROK A202 SIKOU V571 CANTO",
    },
    radio: {
        outbound: {
            DEP: {
                GND: "121.875",
                GND2: "122.6",
                TWR: "118.4",
                DEP: "122.0",
                DEP2: "123.475"
            },
            PECAN: "HKG 127.1",
            ENVAR: "TPE 129.1",
            SIKOU: "SNA 133.35",
            SAMAS: "SNA 133.2",
            ASSAD: "HAN 125.9",
            VILAO: "VTN 128.3",
            SAV  : "BKK 132.1",
            RAMEI: "BKK 133.1",
            ARR: {
                APP: "119.1",
				TWR: "118.2",
                GND_E: "121.65",
                GND_APN: "121.75"
            }
        },
        inbound: {
            DEP: {
                GND_APN: "121.75",
                GND_W: "121.95",
                TWR: "119.1",
                DEP: "119.25",
                DEP2: "133.1",
                
            },
            SELKA: "BKK 132.1",
            SAV   : "VTN 128.3",
            VILAO : "HAN 125.9",
            ASSAD : "SNA 133.35",
            SIKOU : "HKG 127.1",
            
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