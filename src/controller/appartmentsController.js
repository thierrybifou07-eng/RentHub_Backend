import express from "express"
import { fail, success } from "../helpers/appHelper.js";

export const getAppartments = async (req, res) => {
    return res.status(200).json(success('The appartments'))
    console.log('The appartments');
}

export const getAppartmentsById = async (req, res) => {
    const id = req.params.id
    if (id > 100) return res.status(404).json(fail('not found'))
    return res.status(200).json(success(`The appartment with the id ${id}`, id))
}