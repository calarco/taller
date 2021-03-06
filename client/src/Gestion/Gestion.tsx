import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";

import { Device } from "globalStyle";
import { useActive } from "Gestion/context/activeContext";
import { CarNameProvider } from "Gestion/context/carNameContext";
import Bar from "./Bar";

import { Busqueda } from "Gestion/sections/Busqueda";
import Buscador from "Gestion/Buscador";
import ClienteCard from "Gestion/cards/ClienteCard";
import Vehiculos from "Gestion/sections/Vehiculos";
import Reparaciones from "Gestion/sections/Reparaciones";
import { Turnos } from "Gestion/sections/Turnos";
import { Presupuesto } from "Gestion/sections/Presupuesto";

import ClienteForm from "Gestion/forms/ClienteForm";
import PresupuestoForm from "Gestion/forms/PresupuestoForm";

const Container = styled.main`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: grid;
    justify-content: center;
    grid-template-rows: 1fr 1.75rem;
`;

const Panels = styled.div`
    width: 100vw;
    max-width: 95rem;
    height: 100%;
    padding: 1.5rem 2rem;
    display: grid;
    gap: 2rem;
    grid-template-columns: 3fr 2fr;

    @media ${Device.desktop} {
        padding: 1.5rem 2rem;
        gap: 2rem;
    }
`;

const Panel = styled.div`
    position: relative;
    height: calc(100vh - 4.75rem);
    border-radius: 4px;
    background: var(--surface-variant);
    outline: var(--border-variant);
    box-shadow: var(--shadow-variant);
    display: grid;
    grid-template-rows: auto 1fr;
`;

type Props = {
    readonly isActive?: boolean;
};

const Side = styled.div<Props>`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 4px;
    display: grid;
    grid-template-rows: auto 1fr;

    ${(props) =>
        !props.isActive &&
        css`
            pointer-events: none;
        `};
`;

type ComponentProps = {
    setUser: (user: any) => void;
    darkTheme: boolean;
    setDarkTheme: (darkTheme: boolean) => void;
};

const Gestion = function ({
    setUser,
    darkTheme,
    setDarkTheme,
}: ComponentProps) {
    const { clienteId, activeCard, setActiveCard } = useActive();

    const [busqueda, setBusqueda] = useState("");
    const [createCliente, setCreateCliente] = useState(false);
    const [createPresupuesto, setCreatePresupuesto] = useState(false);

    useEffect(() => {
        activeCard !== "Cliente" && setCreateCliente(false);
        activeCard !== "Presupuesto" && setCreatePresupuesto(false);
    }, [activeCard]);

    useEffect(() => {
        createCliente ? setActiveCard("Cliente") : setActiveCard("");
    }, [createCliente, setActiveCard]);

    useEffect(() => {
        createPresupuesto ? setActiveCard("Presupuesto") : setActiveCard("");
    }, [createPresupuesto, setActiveCard]);

    return (
        <CarNameProvider>
            <Container>
                <Panels>
                    <Panel>
                        <Busqueda busqueda={busqueda} />
                        <Reparaciones />
                        <Presupuesto />
                        <PresupuestoForm isActive={createPresupuesto} />
                        <Buscador
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            createCliente={createCliente}
                            setCreateCliente={setCreateCliente}
                            setCreatePresupuesto={setCreatePresupuesto}
                        />
                    </Panel>
                    <Panel>
                        <Turnos overlay={clienteId !== 0} />
                        <Side isActive={clienteId !== 0}>
                            <Vehiculos />
                            <ClienteCard createCliente={createCliente} />
                        </Side>
                        <ClienteForm isActive={createCliente} />
                    </Panel>
                </Panels>
                <Bar
                    setUser={setUser}
                    darkTheme={darkTheme}
                    setDarkTheme={setDarkTheme}
                />
            </Container>
        </CarNameProvider>
    );
};

export default Gestion;
