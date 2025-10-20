import React, { useEffect } from 'react';
import type { AuthProvider } from 'react-admin';



const auth = {


        async login({username,password}) {


            const request = new Request(NULL, { //replace null with backend database later.
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),

        });
        let response;
        try {
            response = await fetch(request);
        } catch (_error) {
            throw new Error('Network error');
        }
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText);
        }
        const authToken = await response.json();
        localStorage.setItem('authToken', JSON.stringify(authToken));
    },

        logout() {
        localStorage.removeItem("authToken");
        },



        };




