import React, { MouseEvent, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import feathersClient from "feathersClient";

import FormComponent from "components/Form";
import Label from "components/Label";
import Modelo from "components/Modelo";

type Inputs = {
    motivo: string;
};

type ComponentProps = {
    fecha: string;
    edit: boolean;
    unEdit: (event: MouseEvent<HTMLButtonElement>) => void;
};

const Form = function ({ fecha, edit, unEdit }: ComponentProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    const [modeloId, setModeloId] = useState(0);

    const onSubmit: SubmitHandler<Inputs> = (data) =>
        feathersClient
            .service("turnos")
            .create({
                fecha: fecha,
                motivo: data.motivo,
                modeloId: modeloId,
            })
            .then(() => {})
            .catch((error: FeathersErrorJSON) => {
                console.error(error.message);
            });

    return (
        <FormComponent
            edit={edit}
            unEdit={unEdit}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Label title="Motivo" error={errors.motivo && "Ingrese el motivo"}>
                <input
                    type="text"
                    placeholder="-"
                    autoComplete="off"
                    {...register("motivo", { required: true })}
                />
            </Label>
            <Modelo modeloId={modeloId} setModeloId={setModeloId} />
        </FormComponent>
    );
};

export default Form;