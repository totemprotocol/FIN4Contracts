import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core';

const PROPERTY_DEFAULT = {
	fixedQuantity: 1,
	userDefinedQuantityFactor: null
};

function StepValue(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);

	const fields = useRef({});

	const getValue = (draft, prop) => {
		return draft.value.hasOwnProperty(prop) ? draft.value[prop] : PROPERTY_DEFAULT[prop];
	};

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		let fixed = getValue(draft, 'fixedQuantity');
		let userDef = getValue(draft, 'userDefinedQuantityFactor');
		fields.current.value = {
			fixedQuantity: fixed,
			userDefinedQuantityFactor: userDef
		};

		if (fixed && userDef) {
			alert('Both fixedQuantity and userDefinedQuantityFactor are set. One of them must be null.');
		}

		if (userDef) {
			setChoice('userDefinedQuantityFactor');
		}

		setDraftId(draft.id);
	});

	const submit = () => {
		fields.current.lastModified = moment().valueOf();

		if (choice === 'fixedQuantity') {
			fields.current.value.userDefinedQuantityFactor = null;
		}

		if (choice === 'userDefinedQuantityFactor') {
			fields.current.value.fixedQuantity = null;
		}

		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			fields: fields.current
		});
		props.handleNext();
	};

	const [choice, setChoice] = useState('fixedQuantity');

	return (
		<>
			{draftId && (
				<>
					<table>
						<tbody>
							<tr>
								<td>
									<RadioGroup
										style={{ paddingTop: '25px' }}
										row={true}
										onChange={e => setChoice(e.target.value)}
										value={choice}>
										<FormControlLabel value="fixedQuantity" control={<Radio />} label="Fixed" />
										<FormControlLabel value="userDefinedQuantityFactor" control={<Radio />} label="User defined" />
									</RadioGroup>
								</td>
								<td>
									<TextField
										disabled={choice !== 'fixedQuantity'}
										type="number"
										label="per claim"
										defaultValue={fields.current.value.fixedQuantity}
										onChange={e => (fields.current.value.fixedQuantity = e.target.value)}
									/>
									<TextField
										disabled={choice !== 'userDefinedQuantityFactor'}
										type="number"
										label="multiplication factor"
										defaultValue={fields.current.value.userDefinedQuantityFactor}
										onChange={e => (fields.current.value.userDefinedQuantityFactor = e.target.value)}
									/>
								</td>
							</tr>
						</tbody>
					</table>
					<br />
					<StepsBottomNav nav={props.nav} handleNext={submit} />
				</>
			)}
		</>
	);
}

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(StepValue, mapStateToProps);
