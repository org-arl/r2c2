import React from 'react'

import { FjageHelper } from "../../assets/fjageHelper.js";
import { Management } from "../../assets/jc2.js";
import { StyleSheet, css } from 'aphrodite';

import { Row, Container, InputGroup, FormControl, Button } from 'react-bootstrap';

import Select from 'react-select';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'

toast.configure();

const styles = StyleSheet.create({
	script_box_styles: {
		height: "300px",
		width: "100%",
		fontFamily: "monospace",
		overflowY: "scroll",
		borderStyle: "solid",
		borderWidth: "2px"
	},
	output_styles: {
		height: "200px",
		overflowY: "scroll",
		fontFamily: "monospace",
		borderStyle: "solid",
		width: "100%",
		borderWidth: "2px"
	},
	loader_styles: {
		height: "200px",
		borderStyle: "solid",
		width: "100%",
		borderWidth: "2px",
		textAlign: "center",
		backgroundColor: "#ddd",
		padding: "70px 0"
	}
});

class ScriptControl extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.gateway = FjageHelper.getGateway();

		this.state = {
			code: "<code/>",
			output: " ",
			selectedSubroutine: null,
			fetchingResults: false
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubroutineSelect = this.handleSubroutineSelect.bind(this);

		this.getScript = this.getScript.bind(this);
		this.runScript = this.runScript.bind(this);
		this.putScript = this.putScript.bind(this);
		this.getSubroutines = this.getSubroutines.bind(this);
	}

	componentDidMount() {

		this.scriptBox.addEventListener("input", this.handleChange)
		this.gateway.addConnListener((connected) => {
			if (connected) {
				this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.VEHICLESTATUS'));
				this.gateway.subscribe(this.gateway.topic('org.arl.jc2.enums.C2Topics.MISSIONSTATUS'));

				this.management = new Management(this.gateway);

				this.management.getScript()
				.then(script => {
					// console.log('script', script);
					this.setState({code: script});
				});

			}
		});
	}

	componentDidUpdate() {

	}

	componentWillUnmount() {
		this.gateway.close();
	}

	getSubroutines() {
		var regex = /sub (\w)*( )?{/gi, result, subroutines = [];
		while ( (result = regex.exec(this.state.code)) ) {
			var mySubString = result[0].substring(
				result[0].lastIndexOf("sub") + ("sub").length + 1,
				result[0].lastIndexOf("{")
			);

			subroutines.push({index: result.index, subroutineName: mySubString.trim()});
		}

		return subroutines;
	}

	handleChange() {
		// this.setState({code: this.scriptBox.innerText});
	}

	handleSubroutineSelect(selectedSubroutine) {

		// add links with IDs to scroll to the particular subroutine on selecting it in the dropdown.
		this.scriptBox.innerHTML = this.scriptBox.innerHTML.replace("sub " + selectedSubroutine.value, "sub " + "<a id=\"" + selectedSubroutine.value + "\"></a>" + selectedSubroutine.value);
		const topPos = document.getElementById(selectedSubroutine.value).offsetTop;
		this.scriptBox.scrollTop = topPos - 50;

		this.setState({
			selectedSubroutine: selectedSubroutine
		});
	}

	getScript(){
		this.management.getScript()
		.then(script => {
			this.setState({code: script});
			toast.success("Get script Successful");
		})
		.catch(reason => {
			toast.error('Could not get script', reason);
		});
	}

	pollScriptRunResult(id) {
		this.management.getScriptRunResult(id)
			.then(response => {
				console.log('getScriptRunResult()', response);
				if (response.completed) {
					this.setState({
						output:
							'exitValue: ' + response.exitValue + '\n\n'
							+ 'stdout:\n' + response.output + '\n\n'
							+ 'stderr:\n' + response.error + '\n\n',
						fetchingResults: false
					});
				} else {
					setTimeout(function() {
						this.pollScriptRunResult(id);
					}.bind(this), 1000);
				}
			})
			.catch(reason => {
				toast.error('Could not get script run result', reason);
				this.setState({output: "Error"});
			});
	}

	runScript(){
		if (this.state.selectedSubroutine !== null){
			const subroutine = this.state.selectedSubroutine.value;
			this.setState({
				fetchingResults: true
			});

			this.management.runScript(subroutine)
				.then(id => {
					setTimeout(function() {
						this.pollScriptRunResult(id);
					}.bind(this), 1000);
				})
				.catch(reason => {
					toast.error('Could not run script', reason);
					this.setState({output: "Error"});
				});
		}
	}

	putScript(){
		// change state only when script is saved to vehicle.
		this.setState({code: this.scriptBox.innerText});

		this.management.putScript(this.scriptBox.innerText)
		.then(response => {
			console.log('putScript.response', response);
			toast.success('Put script Successful');
		})
		.catch(reason => {
			toast.error('Could not put script', reason);
		});
	}

	render() {
		document.title = "Script Control";

		var subroutines = this.getSubroutines();
		var subroutineOptions = [];
		subroutines.forEach((subroutine, i) => {
			subroutineOptions.push({ value: subroutine.subroutineName, label: subroutine.subroutineName });
		});

		var output = (this.state.fetchingResults) ? <div className={css(styles.loader_styles)}><FontAwesomeIcon icon={faCog} spin color="#444" size="3x"/></div> : <div className={css(styles.output_styles)}><pre>{this.state.output}</pre></div> ;

		return (
			<Container>
				<Row>
					<h3>Script Control</h3>
				</Row>
				<Row>
					<div ref={(ref) => (this.scriptBox = ref)} className={css(styles.script_box_styles)} onChange={this.handleChange} contentEditable="true"><pre>{this.state.code}</pre></div>
				</Row>
				<Row>
					<Button type="submit" variant="outline-success" onClick={this.getScript}>Get</Button>

					<Button type="submit" variant="outline-success" onClick={this.putScript}>Put</Button>
					<Select
						value={this.state.selectedSubroutine}
						onChange={this.handleSubroutineSelect}
						options={subroutineOptions}
						className={'subroutine_select_styles'}
					/>
					<Button type="submit" variant="outline-success" onClick={this.runScript}>Run</Button>
				</Row>
				<Row>
					{output}
				</Row>
			</Container>
		);
	}
}

export default ScriptControl;
