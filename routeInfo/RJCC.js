export const RJCC = {
    route: {
        outbound: "+++CHECK+++ DALOL V631 ENVAR M750 MOMPA Y25 ISKUP",
        inbound: "DALBI Y120 TAPPI Y12 ARIKA Y14 MIHOU Y45 HKC Y50 IGMON A1 ELATO V522 ABBEY"
    },
    radio: {
        outbound: {
            DEP: {
                GND: "121.875",
                GND2: "122.6",
                TWR: "118.4",
                DEP: "123.8",
                DEP2: "133.825",
            },
            DALOL: "HKG 118.925",
            ENVAR: "TPE 129.1",
            TONGA: "TPE 126.7",
            PILOX: "TPE 123.6",
            MOLKA: "FUK 127.5",
            INVAM: "FUK 135.3",
            MORE: "FUK _____",
            ARR: {
                TWR: "118.4",
                GND: "121.7"
            }
        },
        inbound: {
            DEP: {
                GND: "121.95",
                GND2: "121.6",
                TWR: "118.8",
                DEP: "CTS 124.7",
                FL150: "TOK 119.3",
            },
            DALBI: "FUK 133.3",
            NYUDO: "FUK120.75",
            GOLDO: "FUK 133.025",
            SAMON: "FUK 124.15",
            SUGNO_MIHOU: "FUK 133.15",
            SOBOH_OOITA: "FUK 135.3",
            JEDAI: "FUK 127.5",
            BULAN: "TPE 123.6",
            APU: "TPE 126.7",
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