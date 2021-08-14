import React from "react";
import styled, { css } from "styled-components";

type Props = {
    readonly edit?: boolean;
};

const Container = styled.form<Props>`
    will-change: opacity;
    content-visibility: auto;
    position: absolute;
    z-index: 1500;
    top: -1px;
    left: -1px;
    right: -1px;
    overflow: hidden;
    border-radius: 4px;
    border: 1px solid var(--primary);
    box-shadow: var(--shadow);
    background: var(--primary);
    display: grid;
    gap: 1px;
    align-items: start;
    transition: 0.25s ease-in;

    label {
        height: 100%;
        padding: 0.5rem 1rem;
        background: var(--surface);
    }

    ${(props) =>
        !props.edit &&
        css`
            visibility: hidden;
            opacity: 0;
            transform: translateY(-0.75rem);
            transition: 0.3s ease-in;
        `};
`;

const Buttons = styled.div<Props>`
    grid-column-start: 1;
    grid-column-end: span end;
    width: 100%;
    height: 3rem;
    overflow: hidden;
    background: var(--surface);
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

type ComponentProps = {
    edit: boolean;
    unEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    children: React.ReactNode;
    className?: string;
};

const Form = function ({
    edit,
    unEdit,
    onSubmit,
    children,
    className,
}: ComponentProps) {
    return (
        <Container edit={edit} onSubmit={onSubmit} className={className}>
            {children}
            <Buttons>
                <button type="button" onClick={unEdit}>
                    Cancelar
                </button>
                <button type="submit" onClick={() => {}}>
                    Guardar
                </button>
            </Buttons>
        </Container>
    );
};

export default Form;
