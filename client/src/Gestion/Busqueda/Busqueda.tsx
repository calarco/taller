import React, { useState, useEffect, startTransition } from "react";
import feathersClient from "feathersClient";
import styled, { css } from "styled-components";
import transition from "styled-transition-group";
import { SwitchTransition } from "react-transition-group";

import { useGestion } from "Gestion/gestionContext";
import SectionComponent from "components/Section";
import ClienteBox from "./ClienteBox";
import VehiculoBox from "./VehiculoBox";
import PresupuestoBox from "./PresupuestoBox";
import Recents from "./Recents";

const Container = transition(SectionComponent).attrs({
    unmountOnExit: true,
    timeout: {
        enter: 300,
        exit: 150,
    },
})`
    content-visibility: auto;
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 25rem;
    max-height: 100%;
    padding: 0;
    padding-top: 3rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;

    &:enter {
        opacity: 0;
    }

    &:enter-active {
        opacity: 1;
        transition: 0.3s ease-out;
    }

    &:exit {
        opacity: 1;
    }

    &:exit-active {
        opacity: 0;
        transition: 0.15s ease-in;
    }
`;

const Empty = styled.h5`
    padding: 2rem;
    text-align: center;
    color: var(--on-background-variant);
`;

type Props = {
    readonly active?: boolean;
    readonly loading?: boolean;
};

const Buscador = styled.form<Props>`
    position: absolute;
    z-index: 500;
    top: 0;
    right: 0;
    left: 0;
    height: 3rem;
    border-radius: 4px 4px 0 0;
    overflow: hidden;
    background: var(--overlay);
    backdrop-filter: blur(0.4rem);
    display: grid;
    grid-template-columns: auto 1fr auto;
    transition: 0.15s ease-in;

    ${(props) =>
        props.active &&
        css`
            border-radius: 4px;
            background: var(--surface-t);
            box-shadow: var(--shadow);
            transition: 0.2s ease-out;
        `};

    input[type="search"] {
        margin: 0;
        border: none;
    }

    input[type="search"]:focus {
        border: none;
        box-shadow: none;
    }
`;

const FilterButton = styled.button`
    height: 100%;
    width: 8.5rem;
    padding: 0;
    border-radius: 4px 0 0 4px;
    border: none;
    color: var(--secondary);

    &::after {
        content: "";
        position: absolute;
        top: calc(50% - 1rem);
        right: 0;
        height: 2rem;
        border-right: 1px solid var(--secondary-variant);
    }
`;

const CreateButton = transition.button.attrs({
    unmountOnExit: true,
    timeout: {
        enter: 200,
        exit: 150,
    },
})`
    height: 100%;
    padding: 0 1.5rem;
    margin: 0;
    border-radius: 0 4px 4px 0;
    border: none;
    color: var(--secondary);

    &::after {
        content: "";
        position: absolute;
        top: calc(50% - 1rem);
        left: 0;
        height: 2rem;
        border-left: 1px solid var(--secondary-variant);
    }
    
    &:enter {
        opacity: 0;
        transform: translateX(3rem);
    }

    &:enter-active {
        opacity: 1;
        transform: initial;
        transition: 0.2s ease-out;
    }

    &:exit {
        opacity: 1;
    }

    &:exit-active {
        opacity: 0;
        transform: translateX(3rem);
        transition: 0.15s ease-in;
    }
`;

type ComponentProps = {
    createCliente: boolean;
    setCreateCliente: (createCliente: boolean) => void;
    setCreatePresupuesto: (createPresupuesto: boolean) => void;
};

const Busqueda = function ({
    createCliente,
    setCreateCliente,
    setCreatePresupuesto,
}: ComponentProps) {
    const {
        clienteId,
        setClienteId,
        vehiculoId,
        setVehiculoId,
        presupuestoId,
        setPresupuestoId,
        activeCard,
        setActiveCard,
    } = useGestion();

    const [count, setCount] = useState(0);
    const [busqueda, setBusqueda] = useState("");
    const [clientes, setClientes] = useState<Clientes>({
        total: 0,
        limit: 0,
        skip: 0,
        data: [
            {
                id: 0,
                nombre: "",
                apellido: "",
                email: "",
                dni: "",
                telefono: "",
                empresa: "",
                createdAt: "",
                updatedAt: "",
            },
        ],
    });
    const [vehiculos, setVehiculos] = useState<Vehiculos>({
        total: 0,
        limit: 0,
        skip: 0,
        data: [
            {
                id: 0,
                patente: "",
                year: "",
                combustible: "",
                cilindrada: "",
                vin: "",
                createdAt: "",
                updatedAt: "",
                clienteId: 0,
                modeloId: 0,
            },
        ],
    });
    const [presupuestos, setPresupuestos] = useState<Presupuestos>({
        total: 0,
        limit: 0,
        skip: 0,
        data: [
            {
                id: 0,
                patente: "",
                km: "",
                motivo: "",
                labor: "",
                repuestos: [{ cantidad: "", repuesto: "", precio: "" }],
                createdAt: "",
                updatedAt: "",
                modeloId: 0,
            },
        ],
    });

    useEffect(() => {
        busqueda !== "" &&
            feathersClient
                .service("clientes")
                .find({
                    query: {
                        $or: [
                            { nombre: { $iLike: `${busqueda}%` } },
                            { apellido: { $iLike: `${busqueda}%` } },
                        ],
                        $limit: 10,
                        $sort: {
                            updatedAt: -1,
                        },
                    },
                })
                .then((clientes: Clientes) => {
                    setCount((count) => count + 1);
                    setClientes(clientes);
                })
                .catch((error: FeathersErrorJSON) => {
                    console.error(error.message);
                }) &&
            feathersClient
                .service("vehiculos")
                .find({
                    query: {
                        patente: { $iLike: `${busqueda}%` },
                        $limit: 10,
                        $sort: {
                            updatedAt: -1,
                        },
                    },
                })
                .then((vehiculos: Vehiculos) => {
                    setCount((count) => count + 1);
                    setVehiculos(vehiculos);
                })
                .catch((error: FeathersErrorJSON) => {
                    console.error(error.message);
                }) &&
            feathersClient
                .service("presupuestos")
                .find({
                    query: {
                        patente: { $iLike: `${busqueda}%` },
                        $limit: 10,
                        $sort: {
                            updatedAt: -1,
                        },
                    },
                })
                .then((presupuestos: Presupuestos) => {
                    setCount((count) => count + 1);
                    setPresupuestos(presupuestos);
                })
                .catch((error: FeathersErrorJSON) => {
                    console.error(error.message);
                });
    }, [busqueda]);

    return (
        <>
            <SwitchTransition>
                <Container
                    key={count}
                    overlay={activeCard === "Presupuesto" ? true : false}
                    onClick={() => {
                        setActiveCard("");
                    }}
                >
                    {busqueda === "" ? (
                        <Recents />
                    ) : presupuestos.data[0] ||
                      vehiculos.data[0] ||
                      clientes.data[0] ? (
                        <>
                            {vehiculos.data.map((aVehiculo) => (
                                <VehiculoBox
                                    key={aVehiculo.id}
                                    vehiculo={aVehiculo}
                                    active={aVehiculo.clienteId === clienteId}
                                />
                            ))}
                            {presupuestos.data.map((aPresupuesto) => (
                                <PresupuestoBox
                                    key={aPresupuesto.id}
                                    presupuesto={aPresupuesto}
                                    onClick={() => {
                                        setPresupuestoId(aPresupuesto.id);
                                    }}
                                />
                            ))}
                            {clientes.data.map((aCliente) => (
                                <ClienteBox
                                    key={aCliente.id}
                                    cliente={aCliente}
                                    onClick={() => {
                                        setClienteId(aCliente.id);
                                        setVehiculoId(0);
                                    }}
                                />
                            ))}
                        </>
                    ) : (
                        <Empty>No se encontraron resultados</Empty>
                    )}
                </Container>
            </SwitchTransition>
            <Buscador
                autoComplete="off"
                active={vehiculoId === 0 && presupuestoId === 0 ? true : false}
            >
                <FilterButton
                    type="button"
                    onClick={() => setCreatePresupuesto(true)}
                >
                    Presupuesto
                </FilterButton>
                <input
                    type="search"
                    name="search"
                    placeholder="Buscar"
                    onChange={(event) =>
                        startTransition(() => {
                            setBusqueda(event.target.value);
                        })
                    }
                    onFocus={() => {
                        setVehiculoId(0);
                        setPresupuestoId(0);
                    }}
                    value={busqueda}
                    autoFocus
                />
                <CreateButton
                    in={!createCliente}
                    type="button"
                    onClick={() => {
                        setCreateCliente(true);
                    }}
                >
                    Crear cliente
                </CreateButton>
            </Buscador>
        </>
    );
};

export default Busqueda;
