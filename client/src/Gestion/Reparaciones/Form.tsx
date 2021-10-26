import React, {
    MouseEvent,
    ChangeEvent,
    FormEvent,
    useState,
    useEffect,
} from "react";
import feathersClient from "feathersClient";
import styled, { css } from "styled-components";

import FormComponent from "components/Form";

type Props = {
    readonly error?: boolean;
};

const Container = styled(FormComponent)`
    grid-template-columns: auto 1fr auto [end];
`;

const Label = styled.label<Props>`
    ${(props) =>
        props.error &&
        css`
            font-weight: 500;
            color: var(--error-variant);
        `};
`;

const Text = styled.label<Props>`
    grid-column-end: span 2;

    ${(props) =>
        props.error &&
        css`
            font-weight: 500;
            color: var(--error-variant);
        `};
`;

const Number = styled.label`
    grid-column-start: 3;
    text-align: right;
`;

type Inputs = {
    fecha: string;
    km: string;
    reparacion: string;
    repuestos: string;
    labor: string;
    costo: string;
    vehiculoId: number;
};

type ComponentProps = {
    reparacion: Reparacion;
    edit: boolean;
    unEdit: (e: MouseEvent<HTMLButtonElement>) => void;
};

const Form = function ({ reparacion, edit, unEdit }: ComponentProps) {
    const [inputs, setInputs] = useState<Inputs>({
        fecha: "",
        km: "",
        reparacion: "",
        repuestos: "",
        labor: "",
        costo: "",
        vehiculoId: 0,
    });
    const [errors, setErrors] = useState({ km: "", reparacion: "" });

    const capitalize = (text: string) => {
        return text.charAt(0).toUpperCase() + text.substring(1);
    };

    const validate = (inputs: Inputs) => {
        inputs.km === ""
            ? setErrors((errors) => ({
                  ...errors,
                  km: "Ingrese el kilometraje",
              }))
            : setErrors((errors) => ({
                  ...errors,
                  km: "",
              }));
        inputs.reparacion === ""
            ? setErrors((errors) => ({
                  ...errors,
                  reparacion: "Ingrese la reparación",
              }))
            : setErrors((errors) => ({
                  ...errors,
                  reparacion: "",
              }));
    };

    const handleCreate = (event: FormEvent) => {
        event.preventDefault();
        validate(inputs);
        errors.km === "" &&
            errors.reparacion === "" &&
            feathersClient
                .service("reparaciones")
                .create({
                    km: parseInt(inputs.km),
                    reparacion: inputs.reparacion,
                    repuestos: inputs.repuestos,
                    costo: inputs.costo,
                    labor: inputs.labor,
                    createdAt: new Date(inputs.fecha).toISOString(),
                    updatedAt: new Date().toISOString(),
                    vehiculoId: inputs.vehiculoId,
                })
                .then(() => {})
                .catch((error: FeathersErrorJSON) => {
                    console.error(error.message);
                });
    };

    const handleEdit = (event: FormEvent) => {
        event.preventDefault();
        validate(inputs);
        errors.km === "" &&
            errors.reparacion === "" &&
            feathersClient
                .service("reparaciones")
                .patch(reparacion.id, {
                    km: parseInt(inputs.km),
                    reparacion: inputs.reparacion,
                    repuestos: inputs.repuestos,
                    costo: inputs.costo,
                    labor: inputs.labor,
                    createdAt: new Date(inputs.fecha).toISOString(),
                })
                .then(() => {})
                .catch((error: FeathersErrorJSON) => {
                    console.error(error.message);
                });
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.persist();
        setInputs((inputs) => ({
            ...inputs,
            [event.target.name]:
                event.target.name === "reparacion" || "repuestos"
                    ? capitalize(event.target.value)
                    : event.target.value,
        }));
    };

    useEffect(() => {
        setInputs({
            fecha: reparacion.createdAt.substring(0, 10),
            km: reparacion.km,
            reparacion: reparacion.reparacion,
            repuestos: reparacion.repuestos,
            labor: reparacion.labor,
            costo: reparacion.costo,
            vehiculoId: reparacion.vehiculoId,
        });
        setErrors({ km: "", reparacion: "" });
    }, [reparacion]);

    return (
        <Container
            edit={edit}
            unEdit={unEdit}
            onSubmit={reparacion.id === 0 ? handleCreate : handleEdit}
        >
            <label>
                Fecha
                <input
                    type="date"
                    name="fecha"
                    placeholder="-"
                    value={inputs.fecha}
                    onChange={handleInputChange}
                    required
                />
            </label>
            <Label error={errors.km === "" ? false : true}>
                {errors.km === "" ? "KM" : errors.km}
                <input
                    type="number"
                    min="0000000"
                    max="9999999"
                    name="km"
                    placeholder={reparacion.km}
                    value={inputs.km}
                    onChange={handleInputChange}
                />
            </Label>
            <Number>
                Total
                <h4>
                    $
                    {(parseInt(inputs.costo, 10) || 0) +
                        (parseInt(inputs.labor, 10) || 0)}
                </h4>
            </Number>
            <Text error={errors.reparacion === "" ? false : true}>
                {errors.reparacion === "" ? "Reparación" : errors.reparacion}
                <input
                    type="text"
                    name="reparacion"
                    placeholder="-"
                    value={inputs.reparacion}
                    onChange={handleInputChange}
                    autoComplete="off"
                    required
                />
            </Text>
            <Number>
                Mano de obra
                <input
                    type="number"
                    min="0000000"
                    max="9999999"
                    name="labor"
                    placeholder="$0"
                    value={inputs.labor}
                    onChange={handleInputChange}
                />
            </Number>
            <Text>
                Repuestos
                <input
                    type="text"
                    name="repuestos"
                    placeholder="-"
                    value={inputs.repuestos}
                    onChange={handleInputChange}
                    autoComplete="off"
                />
            </Text>
            <Number>
                Repuestos
                <input
                    type="number"
                    min="0000000"
                    max="9999999"
                    name="costo"
                    placeholder="$0"
                    value={inputs.costo}
                    onChange={handleInputChange}
                />
            </Number>
        </Container>
    );
};

export default Form;
