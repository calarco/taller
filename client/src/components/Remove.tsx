import React from "react";
import styled, { css } from "styled-components";

type Props = {
    readonly remove?: boolean;
};

const Container = styled.div<Props>`
    position: absolute;
    z-index: 1001;
    top: -1px;
    right: -1px;
    bottom: -1px;
    left: -1px;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(0.5rem);
    border: 1px solid var(--error);
    display: grid;
    align-items: center;
    text-align: center;
    grid-template-rows: 1fr auto;
    transition: 0.25s ease-in;

    ${(props) =>
        !props.remove &&
        css`
            visibility: hidden;
            opacity: 0;
            transition: 0.3s ease-in;
            pointer-events: none;
        `};
`;

const Buttons = styled.div<Props>`
    width: 100%;
    height: 3rem;
    overflow: hidden;
    background: var(--surface);
    border-top: var(--border);
    display: flex;
    transition: 0.25s ease-out;

    button {
        width: 100%;
        height: 3rem;
        margin: 0;
        padding: 0 1.5rem;
        border-radius: 0px;
        background: none;
        border: none;

        &:not(:first-child)::after {
            content: "";
            position: absolute;
            top: calc(50% - 1rem);
            left: 0;
            height: 2rem;
            border-left: var(--border);
        }
    }
`;

const VehiculoForm = function ({ remove, unRemove, handleDelete, children }) {
    return (
        <Container remove={remove}>
            <h5>{children}</h5>
            <Buttons>
                <button type="button" onClick={unRemove}>
                    Cancelar
                </button>
                <button type="reset" onClick={handleDelete}>
                    Borrar
                </button>
            </Buttons>
        </Container>
    );
};

export default VehiculoForm;
